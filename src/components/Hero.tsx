import Image from 'next/image';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';

export default function Hero() {
  return (
    <>
      <section className="brandhero" aria-labelledby="hero-heading">
        <div className="brandhero__emblem" aria-hidden="true">
          <span className="brandhero__halo" />
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
          <div className="brandhero__actions">
            <a className="btn-gold" href="#registration">
              Register as a student
            </a>
            <a className="btn-glass" href={SITE.phoneTel}>
              Call<span className="brandhero__num tabular-nums">{SITE.phoneDisplay}</span>
            </a>
            <a
              className="btn-glass"
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
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
