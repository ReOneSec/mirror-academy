import Icon from '@/components/icons/Icon';
import type { KubaiIconName } from '@/components/icons/kubai-data';
import { SITE } from '@/lib/constants';

const REASONS: { icon: KubaiIconName; title: string; body: string }[] = [
  {
    icon: 'target',
    title: 'Exam-focused coaching',
    body: 'Structured preparation for WBPSC, WBCS, police, medical, engineering, and teaching exams.',
  },
  {
    icon: 'map',
    title: 'Located in Berhampore',
    body: 'Local coaching in Gorabazar, Berhampore, with no long commute for students in Murshidabad.',
  },
  {
    // TODO: confirm admission flow wording with owner
    icon: 'users',
    title: 'Enquiry-led admission',
    body: 'Send an enquiry, get a call back, then visit us. No pressure.',
  },
];

export default function WhyMirror() {
  return (
    <section
      id="why-mirror"
      aria-labelledby="why-heading"
      className="border-y border-rule bg-sheet py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[22rem_1fr] lg:gap-20">
        <div>
          <h2
            id="why-heading"
            className="w-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
          >
            Why Mirror Academy?
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Coaching for WBPSC, WBCS and related exams since {SITE.since}, close to home and built around the exam
            you are preparing for.
          </p>
        </div>

        {/* Not a sequence, so no numbers: a ruled list, like entries on a notice */}
        <ul className="border-t border-rule">
          {REASONS.map(({ icon, title, body }) => (
            <li
              key={title}
              className="grid grid-cols-[2rem_1fr] gap-x-4 border-b border-rule py-7 sm:grid-cols-[2rem_14rem_1fr] sm:gap-x-6"
            >
              <Icon name={icon} size={28} className="mt-0.5" />
              <h3 className="text-xl font-semibold leading-snug">{title}</h3>
              <p className="col-start-2 mt-1.5 leading-relaxed text-muted sm:col-start-3 sm:mt-0">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
