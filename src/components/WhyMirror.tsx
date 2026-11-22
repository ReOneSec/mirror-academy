import { TargetIcon, MapPinIcon, UsersIcon } from '@/components/Icons';

export default function WhyMirror() {
  return (
    <section id="why-mirror" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold text-navy sm:text-3xl">
          Why Mirror Academy?
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex gap-4">
            <TargetIcon className="mt-0.5 h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <h3 className="mb-1 font-bold text-navy">Exam-focused coaching</h3>
              <p className="text-sm leading-relaxed text-slate">
                Structured preparation for WBPSC, WBCS, police, medical,
                engineering, and teaching exams.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <MapPinIcon className="mt-0.5 h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <h3 className="mb-1 font-bold text-navy">Located in Berhampore</h3>
              <p className="text-sm leading-relaxed text-slate">
                Local coaching in Gorabazar, Berhampore — no long commute for
                students in Murshidabad.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <UsersIcon className="mt-0.5 h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <h3 className="mb-1 font-bold text-navy">Enquiry-led admission</h3>
              <p className="text-sm leading-relaxed text-slate">
                Send an enquiry, get a call back, visit the campus — no pressure.{' '}
                <span className="todo-badge">TODO — confirm with owner</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
