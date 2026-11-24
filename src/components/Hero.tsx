import Image from 'next/image';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';

export default function Hero() {
  return (
    <>
      <section className="hero hero--site" aria-labelledby="hero-heading">
        <div className="hero__copy">
          <Image
            className="hero__logo"
            src="/brand/logo.jpg"
            alt="Mirror Academy logo"
            width={72}
            height={72}
            priority
          />
          <p className="hero__eyebrow">
            {SITE.name} · Since {SITE.since}
          </p>
          <h1 id="hero-heading">{SITE.tagline}</h1>
          <p className="hero__sub">
            Coaching for WBPSC, WBCS and related exams in Berhampore, with streams for Medical
            &amp; Engg., Force, Teaching and Mock Interviews.
          </p>
          <p className="hero__meta">Gorabazar, Berhampore · Murshidabad</p>
        </div>
        <aside className="callout" aria-label="Admissions">
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
