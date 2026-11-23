import { MessageIcon, PhoneIcon, BuildingIcon, ArrowRightIcon } from '@/components/Icons';

// TODO — steps 2 and 3 wording to be confirmed with owner
const STEPS = [
  {
    icon: MessageIcon,
    title: 'Enquire',
    body: 'Fill out the form below with your name, phone, and the course you’re interested in.',
  },
  {
    icon: PhoneIcon,
    title: 'Get a call back',
    body: 'Our team will call you to discuss the course, schedule, and answer your questions.',
  },
  {
    icon: BuildingIcon,
    title: 'Visit and enrol',
    body: 'Visit us in Berhampore and complete your enrolment.',
  },
];

export default function HowAdmission() {
  return (
    <section
      id="admission"
      aria-labelledby="admission-heading"
      className="relative isolate overflow-hidden bg-navy-900 py-20 text-white sm:py-28"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-gold-400/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
            Admission
          </p>
          <h2
            id="admission-heading"
            className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            How admission works
          </h2>
          <p className="mt-4 text-lg text-white/70">Three simple steps to get started.</p>
        </div>

        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Connector line (desktop) */}
          <div
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-8 hidden h-px bg-gradient-to-r from-gold-400/0 via-gold-400/50 to-gold-400/0 md:block"
            aria-hidden="true"
          />
          {/* Connector line (mobile) */}
          <div
            className="pointer-events-none absolute bottom-8 left-8 top-8 w-px bg-gradient-to-b from-gold-400/60 via-gold-400/30 to-gold-400/0 md:hidden"
            aria-hidden="true"
          />

          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li
              key={title}
              className="reveal relative flex gap-6 md:flex-col md:items-center md:text-center"
            >
              <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-navy-950 shadow-[0_0_0_8px_rgb(2_27_68)]">
                <Icon className="h-6 w-6 text-gold-400" aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-navy-950">
                  {i + 1}
                </span>
              </div>
              <div className="pt-2 md:max-w-xs md:pt-0">
                <h3 className="font-display text-2xl font-semibold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p className="mt-2 leading-relaxed text-white/70">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 text-center">
          <a
            href="#enquiry"
            className="group inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-bold text-navy-950 transition hover:-translate-y-0.5 hover:bg-gold-300"
          >
            Begin with step one
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
