export const feedbackSections = [
  {
    title: 'Planning & Preparation',
    questions: [
      { id: 'prepared', text: 'The faculty is well prepared and organized for the course.' },
      { id: 'course-plan', text: 'The course content and learning activities are planned and conducted as per the prescribed course plan/schedule.' },
    ],
  },
  {
    title: 'Teaching Effectiveness',
    questions: [
      { id: 'clear-concepts', text: 'Concepts are explained clearly.' },
      { id: 'examples', text: 'Relevant examples, applications, activities, demonstrations or practical illustrations are used to enhance understanding.' },
      { id: 'pace', text: 'The pace of teaching is appropriate.' },
      { id: 'learning-tools', text: 'Appropriate teaching-learning tools, technologies, resources and/or equipment are used effectively to support learning.' },
    ],
  },
  {
    title: 'Student Engagement',
    questions: [
      { id: 'questions', text: 'The teacher encourages questions, discussions and resolution.' },
      { id: 'inclusive-environment', text: 'The learning environment is inclusive, respectful and conducive to effective learning.' },
    ],
  },
  {
    title: 'Assessment',
    questions: [
      { id: 'assessment-methods', text: 'The assessment methods/activities used in the course effectively evaluate my learning.' },
      { id: 'fair-evaluation', text: 'Internal evaluation is time bound and fair.' },
    ],
  },
]

export const feedbackQuestionIds = feedbackSections.flatMap((section) => section.questions.map(({ id }) => id))
