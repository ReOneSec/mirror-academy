import Image from 'next/image';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';

export default function Hero() {
  return (
    <>
      <section className="brandhero" aria-labelledby="hero-heading">
        <div className="brandhero__emblem" aria-hidden="true">
          <Image
            className="brandhero__logo"
            src="/brand/logo-round.webp"
            alt=""
            width={640}
            height={640}
            sizes="(min-width: 900px) 380px, 220px"
            priority
          />
          <Image
            className="brandhero__mirror"
            src="/brand/logo-round.webp"
            alt=""
            width={640}
            height={640}
            sizes="(min-width: 900px) 380px, 220px"
          />
        </div>

        <div className="brandhero__copy">
          <p className="brandhero__eyebrow">
            <span className="brandhero__live" /> Admissions open · Since {SITE.since}
          </p>
          <h1 id="hero-heading" className="brandhero__name">
            Mirror <span>Academy</span>
          </h1>
          <p className="brandhero__tagline">{SITE.tagline}</p>
          <p className="brandhero__sub">
            Coaching for WBPSC, WBCS and related exams in Berhampore, with streams for Medical
            &amp; Engg., Force, Teaching and Mock Interviews.
          </p>
          <aside className="callout brandhero__card" aria-label="Admissions">
            <p className="callout__head">Admissions open</p>
            <p className="callout__lead">
              <strong>Register online</strong> and we&rsquo;ll call you back, or call or WhatsApp{' '}
              <span className="tabular-nums">{SITE.phoneDisplay}</span>.
            </p>
            <div className="links">
              <a className="btn btn--primary" href="#registration">
                Register as a student
              </a>
              <a className="btn" href={SITE.phoneTel}>
                Call
              </a>
              <a className="btn" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </aside>
          <p className="brandhero__meta">Gorabazar, Berhampore · Murshidabad</p>
        </div>
      </section>

      <div className="stats" aria-label="At a glance">
        <div className="stat">
          <p className="stat__fig">{ALL_COURSES.length}</p>
          <p className="stat__label">Courses</p>
        </div>
        <div className="stat">
          <p className="stat__fig">{COURSE_STREAMS.length}</p>
          <p className="stat__label">Streams</p>
        </div>
        <div className="stat">
          <p className="stat__fig">{SITE.since}</p>
          <p className="stat__label">Teaching since</p>
        </div>
        <div className="stat">
          <p className="stat__fig">2</p>
          <p className="stat__label">Batches: Free and Paid</p>
        </div>
      </div>
    </>
  );
}
