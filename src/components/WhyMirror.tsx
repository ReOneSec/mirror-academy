const REASONS = [
  {
    title: 'Exam-focused coaching',
    body: 'Structured preparation for WBPSC, WBCS, police, medical, engineering and teaching exams.',
  },
  {
    title: 'Located in Berhampore',
    body: 'Local coaching in Gorabazar, with no long commute for students in Murshidabad.',
  },
  {
    // TODO: confirm admission flow wording with owner
    title: 'Enquiry-led admission',
    body: 'Send an enquiry, get a call back, then visit us. No pressure.',
  },
];

export default function WhyMirror() {
  return (
    <section id="why-mirror" className="section" aria-labelledby="why-heading">
      <div className="head">
        <p className="head__eyebrow">Why Mirror Academy</p>
        <h2 id="why-heading">Focused coaching, close to home.</h2>
      </div>
      <div className="cards">
        {REASONS.map(({ title, body }) => (
          <div key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
