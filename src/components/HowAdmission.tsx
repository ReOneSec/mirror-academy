export default function HowAdmission() {
  return (
    <section className="bg-chalk py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="mb-10 text-2xl font-bold text-navy sm:text-3xl">
          How admission works
        </h2>

        <ol className="grid gap-8 sm:grid-cols-3">
          <li className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-lg font-bold text-navy">
              1
            </span>
            <div>
              <h3 className="mb-1 font-bold text-navy">Register as a student</h3>
              <p className="text-sm leading-relaxed text-slate">
                Select your batch (Free or Paid), fill in your details, and submit
                your registration below.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-lg font-bold text-navy">
              2
            </span>
            <div>
              <h3 className="mb-1 font-bold text-navy">Get a call back</h3>
              <p className="text-sm leading-relaxed text-slate">
                Our team will call you to discuss the course, schedule, and
                answer your questions.{' '}
                <span className="todo-badge">TODO — confirm with owner</span>
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-lg font-bold text-navy">
              3
            </span>
            <div>
              <h3 className="mb-1 font-bold text-navy">Visit and enrol</h3>
              <p className="text-sm leading-relaxed text-slate">
                Visit our campus in Berhampore, meet the faculty, and complete
                your enrolment.{' '}
                <span className="todo-badge">TODO — confirm with owner</span>
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
