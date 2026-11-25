import { SITE } from '@/lib/constants';

// Every answer restates what the site already says; nothing new is promised here.
const QUESTIONS = [
  {
    q: 'What is the difference between the Free, Paid and Interview batches?',
    a: 'The Free batch is an orientation batch, so you can see how we teach before you commit. The Paid batch is the full course. The Interview batch is mock interview practice for TET, SSC and police interviews. Pick one when you register.',
  },
  {
    q: 'How do I register?',
    a: 'Fill in the registration form on this page with your name, mobile number, course and batch. It takes about a minute, and our team calls you back.',
  },
  {
    q: 'How do I check my registration?',
    a: 'Open the "Check my registration" tab in the registration section and enter the mobile number you registered with.',
  },
  {
    q: 'What happens after I register?',
    a: 'We call you to talk through the course, batch timing and your questions. Then you visit us in Berhampore to complete your enrolment.',
  },
  {
    q: 'Where are you?',
    a: `${SITE.address} Use the map in the contact section for directions.`,
  },
  {
    q: 'Can I ask a question before registering?',
    a: `Yes. Call or WhatsApp ${SITE.phoneDisplay}, or write to ${SITE.email}.`,
  },
];

export default function Faq() {
  return (
    <section id="faq" className="section" aria-labelledby="faq-heading">
      <div className="head">
        <p className="head__eyebrow">Questions</p>
        <h2 id="faq-heading">What students usually ask first.</h2>
      </div>
      <div className="faq">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
