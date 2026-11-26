import { useEffect, useState } from 'react'
import './App.css'
import { feedbackSections } from './feedbackSections.js'

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

function CollegeLogo() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5 12 4l9 5.5H3Z" />
        <path d="M5.5 10v7M9.8 10v7M14.2 10v7M18.5 10v7M4 19h16M3 21h18" />
      </svg>
    </div>
  )
}

function App() {
  const [role, setRole] = useState('')
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [adminLogin, setAdminLogin] = useState({ username: '', password: '' })
  const [step, setStep] = useState(1)
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0)
  const [student, setStudent] = useState({ name: '', rollNumber: '', branch: '', semester: '' })
  const [feedback, setFeedback] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
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
  const savedFeedback = feedback[studentKey] || []
  const selectedFeedback = selectedSubjects.map((_, index) => savedFeedback[index] || ({ ratings: {}, comment: '' }))
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
    if (name === 'branch' || name === 'semester') setCurrentSubjectIndex(0)
  }

  function updateFeedback(subjectIndex, key, value, questionId) {
    setFeedback((current) => ({
      ...current,
      [studentKey]: selectedFeedback.map((item, itemIndex) => (
        itemIndex === subjectIndex
          ? key === 'rating'
            ? { ...item, ratings: { ...item.ratings, [questionId]: value } }
            : { ...item, [key]: value }
          : item
      )),
    }))
  }

  function updateAdminSubject(index, key, value) {
    setAdminSubjects((current) => current.map((subject, subjectIndex) => (
      subjectIndex === index ? { ...subject, [key]: value } : subject
    )))
    setAdminSaved(false)
  }

  function addAdminSubject() {
    setAdminSubjects((current) => [...current, { subject: '', faculty: '' }])
    setAdminSaved(false)
  }

  function removeAdminSubject(index) {
    setAdminSubjects((current) => current.filter((_, subjectIndex) => subjectIndex !== index))
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

  function submitAdminLogin(event) {
    event.preventDefault()
    setAdminAuthenticated(true)
  }

  function changeRole() {
    setRole('')
    setAdminAuthenticated(false)
    setAdminLogin({ username: '', password: '' })
    setStudent({ name: '', rollNumber: '', branch: '', semester: '' })
    setFeedback({})
    setStep(1)
    setSubmitted(false)
  }

  async function submitFeedback(event) {
    event.preventDefault()
    if (currentSubjectIndex < selectedSubjects.length - 1) {
      setCurrentSubjectIndex((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSaving(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          student: {
            name: student.name,
            rollNumber: student.rollNumber,
            branch: student.branch,
            semester: student.semester,
          },
          subjects: selectedSubjects.map(([name, faculty], index) => ({
            name,
            faculty,
            ratings: selectedFeedback[index].ratings,
            comment: selectedFeedback[index].comment,
          })),
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Feedback could not be saved. Please try again.')
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error.message || 'Feedback could not be saved. Please check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function startAnotherResponse() {
    setStudent({ name: '', rollNumber: '', branch: '', semester: '' })
    setStep(1)
    setCurrentSubjectIndex(0)
    setSubmitted(false)
    setFeedback({})
  }

  if (!role) {
    return (
      <main className="page-shell">
        <section className="feedback-card role-card" aria-labelledby="role-title">
          <CollegeLogo />
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

  if (role === 'admin' && !adminAuthenticated) {
    return (
      <main className="page-shell">
        <section className="feedback-card admin-login-card" aria-labelledby="admin-login-title">
          <button className="back-link" type="button" onClick={changeRole}>← Change role</button>
          <CollegeLogo />
          <p className="eyebrow">ADMIN PORTAL</p>
          <h1 id="admin-login-title">Admin sign in</h1>
          <p className="intro">Sign in to manage subjects and faculty assignments.</p>
          <form className="admin-login-form" onSubmit={submitAdminLogin}>
            <div className="field">
              <label htmlFor="admin-username">Admin ID</label>
              <input
                id="admin-username"
                autoComplete="username"
                placeholder="Enter admin ID"
                value={adminLogin.username}
                onChange={(event) => setAdminLogin((current) => ({ ...current, username: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={adminLogin.password}
                onChange={(event) => setAdminLogin((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>
            <button className="submit-button" type="submit">Sign in <span aria-hidden="true">→</span></button>
            <p className="form-note">Demo only — credentials are not verified.</p>
          </form>
        </section>
      </main>
    )
  }

  if (role === 'admin' && adminAuthenticated) {
    return (
      <main className="page-shell">
        <section className="feedback-card admin-card" aria-labelledby="admin-title">
          <header className="page-header">
            <button className="back-link" type="button" onClick={changeRole}>← Change role</button>
            <CollegeLogo />
            <p className="eyebrow">ADMIN</p>
            <h1 id="admin-title">Manage subjects and faculty</h1>
            <p className="intro">Choose a branch and semester to edit the subject and faculty names students will see. Add as many subjects as needed.</p>
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
            <div className="admin-roster-heading"><span>SUBJECT</span><span>FACULTY</span><span aria-hidden="true" /></div>
            {adminSubjects.map((item, index) => (
              <div className="admin-roster-row" key={`${adminKey}-${index}`}>
                <label className="sr-only" htmlFor={`admin-subject-${index}`}>Subject {index + 1} name</label>
                <input id={`admin-subject-${index}`} value={item.subject} onChange={(event) => updateAdminSubject(index, 'subject', event.target.value)} required />
                <label className="sr-only" htmlFor={`admin-faculty-${index}`}>Subject {index + 1} faculty name</label>
                <input id={`admin-faculty-${index}`} value={item.faculty} onChange={(event) => updateAdminSubject(index, 'faculty', event.target.value)} required />
                <button className="remove-subject-button" type="button" aria-label={`Remove subject ${index + 1}`} onClick={() => removeAdminSubject(index)} disabled={adminSubjects.length <= 1}>Remove</button>
              </div>
            ))}
            <button className="add-subject-button" type="button" onClick={addAdminSubject}>＋ Add subject</button>
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
          <button className="back-link" type="button" onClick={changeRole}>← Change role</button>
          <div className="success-mark" aria-hidden="true">✓</div>
          <p className="eyebrow">FEEDBACK RECEIVED</p>
          <h1>Thank you, {student.name.split(' ')[0]}.</h1>
          <p className="intro">Your feedback for {selectedSubjects.length} subjects has been saved.</p>
          <p className="form-note">Your response is stored in this project’s local database.</p>
          <button className="secondary-button" type="button" onClick={startAnotherResponse}>Start another response</button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="feedback-card" aria-labelledby="page-title">
        <header className="page-header">
          <button className="back-link" type="button" onClick={changeRole}>← Change role</button>
          <CollegeLogo />
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
          <form className="feedback-form" onSubmit={(event) => { event.preventDefault(); setCurrentSubjectIndex(0); setStep(2) }}>
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
              <p>Rate each statement from 1 (needs improvement) to 5 (excellent).</p>
            </div>

            <div className="subject-progress">
              <div><strong>Currently rating</strong><span>{currentSubjectIndex + 1} / {selectedSubjects.length}</span></div>
              <div className="subject-progress-track" role="progressbar" aria-valuemin="1" aria-valuemax={selectedSubjects.length} aria-valuenow={currentSubjectIndex + 1} aria-label="Faculty feedback progress">
                <span style={{ width: `${((currentSubjectIndex + 1) / selectedSubjects.length) * 100}%` }} />
              </div>
            </div>

            <div className="subject-list">
              {selectedSubjects.map(([subject, faculty], index) => index === currentSubjectIndex && (
                <article className="subject-card" key={`${student.branch}-${subject}`}>
                  <div className="subject-title">
                    <span className="subject-number">{String(index + 1).padStart(2, '0')}</span>
                    <div><h3>{subject}</h3><p>{faculty}</p></div>
                  </div>
                  <div className="criteria-sections">
                    {feedbackSections.map((section, sectionIndex) => (
                      <section className="criteria-section" key={section.title}>
                        <h4>{section.title}</h4>
                        <div className="criteria-header" aria-hidden="true">
                          <span>Feedback statement</span>
                          {[1, 2, 3, 4, 5].map((rating) => <span key={rating}>{rating}</span>)}
                        </div>
                        {section.questions.map((question, questionIndex) => {
                          const questionNumber = feedbackSections
                            .slice(0, sectionIndex)
                            .reduce((total, previous) => total + previous.questions.length, 0)
                            + questionIndex + 1
                          const inputName = `rating-${studentKey}-${index}-${question.id}`

                          return (
                            <div className="criteria-row" key={question.id}>
                              <p><span>{questionNumber}.</span> {question.text}</p>
                              <fieldset aria-label={`${question.text} rating`}>
                                <legend className="sr-only">Rate from 1 to 5</legend>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <label className="criteria-choice" key={rating}>
                                    <input
                                      type="radio"
                                      name={inputName}
                                      value={rating}
                                      checked={selectedFeedback[index]?.ratings?.[question.id] === String(rating)}
                                      onChange={(event) => updateFeedback(index, 'rating', event.target.value, question.id)}
                                      required
                                    />
                                    <span aria-hidden="true" />
                                    <span className="sr-only">{rating}</span>
                                  </label>
                                ))}
                              </fieldset>
                            </div>
                          )
                        })}
                      </section>
                    ))}
                  </div>
                  <div className="subject-comment">
                    <label className="comment-label" htmlFor={`comment-${index}`}>Additional comment <span>(optional)</span></label>
                    <textarea
                      id={`comment-${index}`}
                      rows="2"
                      placeholder="Share any additional feedback about this subject"
                      value={selectedFeedback[index]?.comment || ''}
                      onChange={(event) => updateFeedback(index, 'comment', event.target.value)}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="subject-actions">
              <button className="secondary-button" type="button" onClick={() => currentSubjectIndex > 0 ? setCurrentSubjectIndex((current) => current - 1) : setStep(1)}>
                {currentSubjectIndex > 0 ? 'Previous faculty' : 'Student details'}
              </button>
              <button className="submit-button" type="submit" disabled={isSaving}>
                {currentSubjectIndex < selectedSubjects.length - 1
                  ? 'Next faculty'
                  : isSaving ? 'Saving feedback…' : 'Submit all feedback'}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            {submitError && <p className="form-error" role="alert">{submitError}</p>}
            <p className="form-note">Roster and faculty names are sample data. Feedback is saved locally when submitted.</p>
          </form>
        )}
      </section>
    </main>
  )
}

export default App
