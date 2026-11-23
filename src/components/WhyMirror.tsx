import { TargetIcon, MapPinIcon, UsersIcon, ArrowRightIcon } from '@/components/Icons';
import { SITE } from '@/lib/constants';

const REASONS = [
  {
    icon: TargetIcon,
    title: 'Exam-focused coaching',
    body: 'Structured preparation for WBPSC, WBCS, police, medical, engineering, and teaching exams.',
  },
  {
    icon: MapPinIcon,
    title: 'Located in Berhampore',
    body: 'Local coaching in Gorabazar, Berhampore — no long commute for students in Murshidabad.',
  },
  {
    // TODO — confirm admission flow wording with owner
    icon: UsersIcon,
    title: 'Enquiry-led admission',
    body: 'Send an enquiry, get a call back, then visit us — no pressure.',
  },
];

export default function WhyMirror() {
  return (
    <section
      id="why-mirror"
      aria-labelledby="why-heading"
      className="relative border-y border-line bg-white py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            Why Mirror
          </p>
          <h2
            id="why-heading"
            className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl"
          >
            Why Mirror Academy?
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate">
            Coaching for {SITE.focus} since {SITE.since} — close to home, and
            built around the exam you are preparing for.
          </p>
          <a
            href="#enquiry"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-navy-900 px-6 py-3 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
          >
            Start your enquiry
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>

        <ul className="grid gap-5">
          {REASONS.map(({ icon: Icon, title, body }, i) => (
            <li
              key={title}
              className="reveal group relative flex flex-col gap-5 rounded-3xl border border-line bg-paper p-6 transition duration-300 hover:border-gold-400/60 hover:bg-white hover:shadow-[0_24px_48px_-28px_rgb(2_27_68/0.3)] sm:flex-row sm:p-8"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-navy-950 shadow-[0_10px_24px_-10px_rgb(255_197_1/0.8)] transition group-hover:rotate-[-4deg]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold tabular-nums text-slate/70" aria-hidden="true">
                  0{i + 1}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 leading-relaxed text-slate">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
