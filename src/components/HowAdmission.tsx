// TODO: steps 2 and 3 wording to be confirmed with owner
const STEPS = [
  {
    title: 'Enquire',
    body: 'Fill out the form below with your name, phone, and the course you’re interested in.',
  },
  {
    title: 'Get a call back',
    body: 'Our team will call you to discuss the course, schedule, and answer your questions.',
  },
  {
    title: 'Visit and enrol',
    body: 'Visit us in Berhampore and complete your enrolment.',
  },
];

export default function HowAdmission() {
  return (
    <section
      id="admission"
      aria-labelledby="admission-heading"
      className="on-ink bg-ink py-20 text-white sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          id="admission-heading"
          className="w-display max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
        >
          How Admission Works
        </h2>

        {/* A real sequence, so it is numbered; the numerals carry the section */}
        <ol className="mt-12 grid gap-0 border-t border-white/20 md:grid-cols-3">
          {STEPS.map(({ title, body }, i) => (
            <li
              key={title}
              className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-b border-white/20 py-8 md:block md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
            >
              <span
                className="w-display text-5xl font-extrabold leading-none text-gold tabular-nums md:text-7xl"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="md:mt-8">
                <h3 className="text-xl font-semibold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p className="mt-2 max-w-xs leading-relaxed text-white/75">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <a
          href="#enquiry"
          className="mt-12 inline-flex items-center justify-center rounded-md bg-gold px-6 py-3.5 text-[1.0625rem] font-semibold text-ink transition-colors hover:bg-gold-2"
        >
          Start With Step 1
        </a>
      </div>
    </section>
  );
}
