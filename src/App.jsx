import { useEffect, useState } from 'react'
import './App.css'

const ROSTER_STORAGE_KEY = 'faculty-feedback-roster-v1'

const subjectsByBranch = {
  CSE: [
    ['Data Structures', 'Dr. A. Sharma'],
    ['Database Management Systems', 'Prof. R. Verma'],
    ['Computer Networks', 'Dr. M. Nair'],
    ['Operating Systems', 'Prof. K. Singh'],
    ['Software Engineering', 'Dr. P. Mehta'],
    ['Artificial Intelligence', 'Prof. S. Kapoor'],
  ],
  'CSE (AI & ML)': [
    ['Programming for AI', 'Dr. A. Sharma'],
    ['Database Management Systems', 'Prof. R. Verma'],
    ['Machine Learning', 'Dr. M. Nair'],
    ['Deep Learning', 'Prof. K. Singh'],
    ['Data Structures', 'Dr. P. Mehta'],
    ['Probability and Statistics', 'Prof. S. Kapoor'],
  ],
  IT: [
    ['Web Technologies', 'Dr. A. Sharma'],
    ['Database Management Systems', 'Prof. R. Verma'],
    ['Computer Networks', 'Dr. M. Nair'],
    ['Java Programming', 'Prof. K. Singh'],
    ['Cybersecurity Fundamentals', 'Dr. P. Mehta'],
    ['Software Engineering', 'Prof. S. Kapoor'],
  ],
  ECE: [
    ['Digital Electronics', 'Dr. A. Sharma'],
    ['Signals and Systems', 'Prof. R. Verma'],
    ['Microprocessors', 'Dr. M. Nair'],
    ['Communication Systems', 'Prof. K. Singh'],
    ['Embedded Systems', 'Dr. P. Mehta'],
    ['Control Systems', 'Prof. S. Kapoor'],
  ],
  Mechanical: [
    ['Thermodynamics', 'Dr. A. Sharma'],
    ['Fluid Mechanics', 'Prof. R. Verma'],
    ['Manufacturing Processes', 'Dr. M. Nair'],
    ['Machine Design', 'Prof. K. Singh'],
    ['Heat Transfer', 'Dr. P. Mehta'],
    ['Industrial Engineering', 'Prof. S. Kapoor'],
  ],
}

function rosterKey(branch, semester) {
  return `${branch}::${semester}`
}

function readSavedAssignments() {
  try {
    const saved = localStorage.getItem(ROSTER_STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function App() {
  const [role, setRole] = useState('')
  const [step, setStep] = useState(1)
  const [student, setStudent] = useState({ name: '', rollNumber: '', branch: '', semester: '' })
  const [feedback, setFeedback] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [assignments, setAssignments] = useState(readSavedAssignments)
  const [adminBranch, setAdminBranch] = useState('CSE')
  const [adminSemester, setAdminSemester] = useState('1')
  const [adminSubjects, setAdminSubjects] = useState(() => subjectsByBranch.CSE.map(([subject, faculty]) => ({ subject, faculty })))
  const [adminSaved, setAdminSaved] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(assignments))
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [assignments])

  const studentKey = rosterKey(student.branch, student.semester)
  const selectedSubjects = assignments[studentKey] || subjectsByBranch[student.branch] || []
  const selectedFeedback = feedback[studentKey] || selectedSubjects.map(() => ({ rating: '', comment: '' }))
  const adminKey = rosterKey(adminBranch, adminSemester)

  function loadAdminRoster(branch, semester) {
    setAdminBranch(branch)
    setAdminSemester(semester)
    const savedOrDefault = assignments[rosterKey(branch, semester)] || subjectsByBranch[branch]
    setAdminSubjects(savedOrDefault.map(([subject, faculty]) => ({ subject, faculty })))
    setAdminSaved(false)
  }

  function updateStudent(event) {
    const { name, value } = event.target
    setStudent((current) => ({ ...current, [name]: value }))
  }

  function updateFeedback(index, key, value) {
    setFeedback((current) => ({
      ...current,
      [studentKey]: selectedFeedback.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [key]: value } : item
      )),
    }))
  }

  function updateAdminSubject(index, key, value) {
    setAdminSubjects((current) => current.map((subject, subjectIndex) => (
      subjectIndex === index ? { ...subject, [key]: value } : subject
    )))
    setAdminSaved(false)
  }

  function saveAdminRoster(event) {
    event.preventDefault()
    setAssignments((current) => ({
      ...current,
      [adminKey]: adminSubjects.map(({ subject, faculty }) => [subject.trim(), faculty.trim()]),
    }))
    setAdminSaved(true)
  }

  function submitFeedback(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  function startAnotherResponse() {
    setStudent({ name: '', rollNumber: '', branch: '', semester: '' })
    setStep(1)
    setSubmitted(false)
    setFeedback({})
  }

  if (!role) {
    return (
      <main className="page-shell">
        <section className="feedback-card role-card" aria-labelledby="role-title">
          <div className="brand-mark" aria-hidden="true">F</div>
          <p className="eyebrow">FACULTY FEEDBACK</p>
          <h1 id="role-title">How would you like to continue?</h1>
          <p className="intro">Choose the type of account you’re using.</p>
          <div className="role-options">
            <button className="role-option" type="button" onClick={() => setRole('student')}>
              <span className="role-icon" aria-hidden="true">S</span>
              <span><strong>Student</strong><small>Submit feedback for your subjects</small></span>
              <span className="role-arrow" aria-hidden="true">→</span>
            </button>
            <button className="role-option admin-option" type="button" onClick={() => setRole('admin')}>
              <span className="role-icon" aria-hidden="true">A</span>
              <span><strong>Admin</strong><small>Manage subjects and faculty</small></span>
              <span className="role-arrow" aria-hidden="true">→</span>
            </button>
          </div>
          <p className="form-note">Admin changes are saved in this browser.</p>
        </section>
      </main>
    )
  }

  if (role === 'admin') {
    return (
      <main className="page-shell">
        <section className="feedback-card admin-card" aria-labelledby="admin-title">
          <header className="page-header">
            <button className="back-link" type="button" onClick={() => setRole('')}>← Change role</button>
            <div className="brand-mark" aria-hidden="true">F</div>
            <p className="eyebrow">ADMIN</p>
            <h1 id="admin-title">Manage subjects and faculty</h1>
            <p className="intro">Choose a branch and semester to edit the subject and faculty names students will see.</p>
          </header>

          <div className="form-row admin-selectors">
            <div className="field">
              <label htmlFor="admin-branch">Branch</label>
              <select id="admin-branch" value={adminBranch} onChange={(event) => loadAdminRoster(event.target.value, adminSemester)}>
                {Object.keys(subjectsByBranch).map((branch) => <option key={branch} value={branch}>{branch}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="admin-semester">Semester</label>
              <select id="admin-semester" value={adminSemester} onChange={(event) => loadAdminRoster(adminBranch, event.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>{`Semester ${semester}`}</option>)}
              </select>
            </div>
          </div>

          <form className="admin-roster" onSubmit={saveAdminRoster}>
            <div className="admin-roster-heading"><span>SUBJECT</span><span>FACULTY</span></div>
            {adminSubjects.map((item, index) => (
              <div className="admin-roster-row" key={`${adminKey}-${index}`}>
                <label className="sr-only" htmlFor={`admin-subject-${index}`}>Subject {index + 1} name</label>
                <input id={`admin-subject-${index}`} value={item.subject} onChange={(event) => updateAdminSubject(index, 'subject', event.target.value)} required />
                <label className="sr-only" htmlFor={`admin-faculty-${index}`}>Subject {index + 1} faculty name</label>
                <input id={`admin-faculty-${index}`} value={item.faculty} onChange={(event) => updateAdminSubject(index, 'faculty', event.target.value)} required />
              </div>
            ))}
            <div className="admin-save-row">
              <p className="form-note" role="status">{adminSaved ? 'Saved. Students will see these assignments.' : 'Sample roster. Edit names and save your changes.'}</p>
              <button className="submit-button" type="submit">Save changes <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </section>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="page-shell">
        <section className="feedback-card success-card" aria-live="polite">
          <div className="success-mark" aria-hidden="true">✓</div>
          <p className="eyebrow">FEEDBACK RECEIVED</p>
          <h1>Thank you, {student.name.split(' ')[0]}.</h1>
          <p className="intro">Your feedback for {selectedSubjects.length} subjects has been submitted.</p>
          <p className="form-note">Demo only — responses are not connected to a server yet.</p>
          <button className="secondary-button" type="button" onClick={startAnotherResponse}>Start another response</button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="feedback-card" aria-labelledby="page-title">
        <header className="page-header">
          <div className="brand-mark" aria-hidden="true">F</div>
          <p className="eyebrow">FACULTY FEEDBACK</p>
          <h1 id="page-title">{step === 1 ? 'Student details' : 'Rate your subjects'}</h1>
          <p className="intro">
            {step === 1
              ? 'Enter your details to see the subjects and faculty assigned to you.'
              : 'Share feedback for each subject and faculty member this semester.'}
          </p>
          <div className="step-indicator" aria-label={`Step ${step} of 2`}>
            <span className={step === 1 ? 'current' : 'complete'}>1 <span>Student</span></span>
            <i />
            <span className={step === 2 ? 'current' : ''}>2 <span>Feedback</span></span>
          </div>
        </header>

        {step === 1 ? (
          <form className="feedback-form" onSubmit={(event) => { event.preventDefault(); setStep(2) }}>
            <div className="field">
              <label htmlFor="student-name">Student name</label>
              <input id="student-name" name="name" autoComplete="name" placeholder="Enter your full name" value={student.name} onChange={updateStudent} required />
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="roll-number">Roll number</label>
                <input id="roll-number" name="rollNumber" placeholder="e.g. 24CS001" value={student.rollNumber} onChange={updateStudent} required />
              </div>
              <div className="field">
                <label htmlFor="semester">Semester</label>
                <select id="semester" name="semester" value={student.semester} onChange={updateStudent} required>
                  <option value="" disabled>Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="branch">Branch</label>
              <select id="branch" name="branch" value={student.branch} onChange={updateStudent} required>
                <option value="" disabled>Select your branch</option>
                {Object.keys(subjectsByBranch).map((branch) => <option key={branch} value={branch}>{branch}</option>)}
              </select>
            </div>

            <button className="submit-button" type="submit">Continue to subjects <span aria-hidden="true">→</span></button>
            <p className="form-note">Demo roster: subject and faculty assignments are sample data.</p>
          </form>
        ) : (
          <form className="feedback-form subject-form" onSubmit={submitFeedback}>
            <div className="student-summary">
              <div><span>STUDENT</span><strong>{student.name}</strong></div>
              <div><span>ROLL NUMBER</span><strong>{student.rollNumber}</strong></div>
              <div><span>BRANCH · SEMESTER</span><strong>{student.branch} · {student.semester}</strong></div>
              <button type="button" onClick={() => setStep(1)}>Edit</button>
            </div>

            <div className="subject-heading">
              <h2>Your subjects <span>{selectedSubjects.length}</span></h2>
              <p>Rate each faculty member from 1 (needs improvement) to 5 (excellent).</p>
            </div>

            <div className="subject-list">
              {selectedSubjects.map(([subject, faculty], index) => (
                <article className="subject-card" key={`${student.branch}-${subject}`}>
                  <div className="subject-title">
                    <span className="subject-number">{String(index + 1).padStart(2, '0')}</span>
                    <div><h3>{subject}</h3><p>{faculty}</p></div>
                  </div>
                  <fieldset className="rating-field">
                    <legend>Faculty rating <span aria-hidden="true">*</span></legend>
                    <div className="rating-options">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <label className="rating-option" key={rating}>
                          <input
                            type="radio"
                            name={`rating-${index}`}
                            value={rating}
                            checked={selectedFeedback[index]?.rating === String(rating)}
                            onChange={(event) => updateFeedback(index, 'rating', event.target.value)}
                            required
                          />
                          <span>{rating}</span>
                        </label>
                      ))}
                    </div>
                    <div className="rating-hints"><span>Needs improvement</span><span>Excellent</span></div>
                  </fieldset>
                  <label className="comment-label" htmlFor={`comment-${index}`}>Comment <span>(optional)</span></label>
                  <textarea
                    id={`comment-${index}`}
                    rows="2"
                    placeholder="Share a brief comment about this class"
                    value={selectedFeedback[index]?.comment || ''}
                    onChange={(event) => updateFeedback(index, 'comment', event.target.value)}
                  />
                </article>
              ))}
            </div>

            <div className="subject-actions">
              <button className="secondary-button" type="button" onClick={() => setStep(1)}>Back</button>
              <button className="submit-button" type="submit">Submit all feedback <span aria-hidden="true">→</span></button>
            </div>
            <p className="form-note">Demo roster and faculty names are sample data. Responses are not saved yet.</p>
          </form>
        )}
      </section>
    </main>
  )
}

export default App
