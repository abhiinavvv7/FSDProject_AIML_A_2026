import { useState } from 'react'
import './App.css'

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

const emptyFeedback = Object.fromEntries(
  Object.keys(subjectsByBranch).map((branch) => [branch, subjectsByBranch[branch].map(() => ({ rating: '', comment: '' }))]),
)

function App() {
  const [role, setRole] = useState('')
  const [step, setStep] = useState(1)
  const [student, setStudent] = useState({ name: '', rollNumber: '', branch: '', semester: '' })
  const [feedback, setFeedback] = useState(emptyFeedback)
  const [submitted, setSubmitted] = useState(false)

  const selectedSubjects = subjectsByBranch[student.branch] || []
  const selectedFeedback = feedback[student.branch] || []

  function updateStudent(event) {
    const { name, value } = event.target
    setStudent((current) => ({ ...current, [name]: value }))
  }

  function updateFeedback(index, key, value) {
    setFeedback((current) => ({
      ...current,
      [student.branch]: current[student.branch].map((item, itemIndex) => (
        itemIndex === index ? { ...item, [key]: value } : item
      )),
    }))
  }

  function submitFeedback(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  function startAnotherResponse() {
    setStudent({ name: '', rollNumber: '', branch: '', semester: '' })
    setStep(1)
    setSubmitted(false)
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
            <button className="role-option admin-option" type="button" disabled>
              <span className="role-icon" aria-hidden="true">A</span>
              <span><strong>Admin</strong><small>Admin access is coming soon</small></span>
              <span className="role-badge">COMING SOON</span>
            </button>
          </div>
          <p className="form-note">Admin tools are not available yet.</p>
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
