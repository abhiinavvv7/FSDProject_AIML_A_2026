import { createServer } from 'node:http'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { feedbackQuestionIds } from '../src/feedbackSections.js'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const databaseDirectory = resolve(projectRoot, 'server', 'data')
const databasePath = resolve(databaseDirectory, 'feedback.sqlite')
const allowedBranches = new Set(['CSE', 'CSE (AI & ML)', 'IT', 'ECE', 'Mechanical'])
const maxBodyBytes = 1024 * 1024

await mkdir(databaseDirectory, { recursive: true })

const database = new DatabaseSync(databasePath)
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS feedback_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    submitted_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subject_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
    subject_position INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    ratings_json TEXT NOT NULL,
    comment TEXT NOT NULL DEFAULT '',
    UNIQUE (submission_id, subject_position)
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_branch_semester
  ON feedback_submissions(branch, semester);

  CREATE INDEX IF NOT EXISTS idx_subject_feedback_submission
  ON subject_feedback(submission_id);
`)

const insertSubmission = database.prepare(`
  INSERT INTO feedback_submissions (student_name, roll_number, branch, semester, submitted_at)
  VALUES (?, ?, ?, ?, ?)
`)

const insertSubjectFeedback = database.prepare(`
  INSERT INTO subject_feedback (
    submission_id, subject_position, subject_name, faculty_name, ratings_json, comment
  ) VALUES (?, ?, ?, ?, ?, ?)
`)

function saveSubmission(payload) {
  const submittedAt = new Date().toISOString()
  database.exec('BEGIN IMMEDIATE')
  try {
    const submissionResult = insertSubmission.run(
      payload.student.name,
      payload.student.rollNumber,
      payload.student.branch,
      payload.student.semester,
      submittedAt,
    )
    const submissionId = Number(submissionResult.lastInsertRowid)

    payload.subjects.forEach((subject, index) => {
      insertSubjectFeedback.run(
        submissionId,
        index + 1,
        subject.name,
        subject.faculty,
        JSON.stringify(subject.ratings),
        subject.comment,
      )
    })

    database.exec('COMMIT')
    return { submissionId, submittedAt }
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  response.end(body)
}

function readJson(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = []
    let size = 0
    let oversized = false

    request.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBodyBytes) {
        oversized = true
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      if (oversized) {
        rejectBody(Object.assign(new Error('Request body is too large.'), { status: 413 }))
        return
      }
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        rejectBody(Object.assign(new Error('Request must contain valid JSON.'), { status: 400 }))
      }
    })
    request.on('error', rejectBody)
  })
}

function isText(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
}

function validateSubmission(payload) {
  if (!payload || typeof payload !== 'object' || !payload.student || !Array.isArray(payload.subjects)) {
    return 'Student details and subject feedback are required.'
  }

  const { student, subjects } = payload
  if (!isText(student.name, 120) || !isText(student.rollNumber, 40)) {
    return 'Enter a valid student name and roll number.'
  }
  if (!allowedBranches.has(student.branch)) {
    return 'Select a valid branch.'
  }
  const semester = Number(student.semester)
  if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
    return 'Select a valid semester.'
  }
  if (subjects.length < 1 || subjects.length > 50) {
    return 'The feedback must contain between 1 and 50 subjects.'
  }

  for (const subject of subjects) {
    if (!subject || !isText(subject.name, 160) || !isText(subject.faculty, 160)) {
      return 'Each subject needs a subject name and faculty name.'
    }
    if (!subject.ratings || typeof subject.ratings !== 'object' || Array.isArray(subject.ratings)) {
      return 'Complete all ratings before submitting.'
    }
    const ratingKeys = Object.keys(subject.ratings)
    if (
      ratingKeys.length !== feedbackQuestionIds.length
      || feedbackQuestionIds.some((id) => !ratingKeys.includes(id)
        || !Number.isInteger(Number(subject.ratings[id]))
        || Number(subject.ratings[id]) < 1
        || Number(subject.ratings[id]) > 5)
    ) {
      return 'Complete all ratings using values from 1 to 5.'
    }
    if (typeof subject.comment !== 'string' || subject.comment.length > 2000) {
      return 'Comments must be 2,000 characters or fewer.'
    }
  }

  return null
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost')

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    const { submissions } = database.prepare('SELECT COUNT(*) AS submissions FROM feedback_submissions').get()
    sendJson(response, 200, { ok: true, submissions })
    return
  }

  if (request.method !== 'POST' || requestUrl.pathname !== '/api/feedback') {
    sendJson(response, 404, { error: 'Endpoint not found.' })
    return
  }

  let payload
  try {
    payload = await readJson(request)
  } catch (error) {
    sendJson(response, error.status || 400, { error: error.message || 'Could not read the request.' })
    return
  }

  const validationError = validateSubmission(payload)
  if (validationError) {
    sendJson(response, 400, { error: validationError })
    return
  }

  try {
    const result = saveSubmission({
      student: {
        name: payload.student.name.trim(),
        rollNumber: payload.student.rollNumber.trim(),
        branch: payload.student.branch,
        semester: Number(payload.student.semester),
      },
      subjects: payload.subjects.map((subject) => ({
        name: subject.name.trim(),
        faculty: subject.faculty.trim(),
        ratings: Object.fromEntries(feedbackQuestionIds.map((id) => [id, Number(subject.ratings[id])])),
        comment: subject.comment.trim(),
      })),
    })
    sendJson(response, 201, { ok: true, ...result })
  } catch {
    sendJson(response, 500, { error: 'Feedback could not be saved. Please try again.' })
  }
})

const port = Number(process.env.API_PORT || 3001)
server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Feedback API listening on http://127.0.0.1:${port}\n`)
})

function shutdown() {
  server.close(() => {
    database.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
