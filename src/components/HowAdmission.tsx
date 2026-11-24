// TODO: confirm steps 2 and 3 wording with owner
const STEPS = [
  {
    eyebrow: 'Register',
    title: 'Register as a student',
    body: 'Choose a Free batch or Paid batch, fill in your details and submit your registration.',
  },
  {
    eyebrow: 'Call back',
    title: 'Get a call back',
    body: 'Our team calls to discuss the course, batch timing and your questions.',
  },
  {
    eyebrow: 'Enrol',
    title: 'Visit and enrol',
    body: 'Visit the campus in Berhampore, meet the faculty and complete your enrolment.',
  },
];

export default function HowAdmission() {
  return (
    <section id="admission" className="section" aria-labelledby="admission-heading">
      <div className="head">
        <p className="head__eyebrow">How admission works</p>
        <h2 id="admission-heading">Three steps from registration to enrolment.</h2>
      </div>
      <ol className="steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {STEPS.map(({ eyebrow, title, body }, i) => (
          <li key={title} className="step">
            <div className="step__intro">
              <p className="step__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </p>
              <p className="step__eyebrow">{eyebrow}</p>
            </div>
            <div>
              <h3>
                <span className="sr-only">Step {i + 1}: </span>
                {title}
              </h3>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <a className="btn btn--primary btn--lg" href="#registration">
        Start with step 1
      </a>
    </section>
  );
}
