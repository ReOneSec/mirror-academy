import Image from 'next/image';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { getDict, num, type Lang } from '@/lib/i18n';

export default function Hero({ lang = 'en' }: { lang?: Lang }) {
  const h = getDict(lang).hero;
  const d = getDict(lang);
  return (
    <>
      <section className="hero hero--site" aria-labelledby="hero-heading">
        <div className="hero__copy">
          <div className="hero__brand">
            <Image
              className="hero__logo"
              src="/brand/logo-round.webp"
              alt=""
              width={320}
              height={320}
              sizes="160px"
              priority
            />
            <h1 id="hero-heading" className="hero__name" translate="no">
              Mirror <span>Academy</span>
            </h1>
          </div>
          <p className="hero__eyebrow">{h.eyebrow(num(lang, SITE.since))}</p>
          <p className="hero__tagline">{SITE.tagline}</p>
          <p className="hero__sub">{h.sub}</p>
          <p className="hero__meta">{h.meta}</p>
        </div>
        <aside className="callout" aria-label={h.calloutHead}>
          <p className="callout__head">{h.calloutHead}</p>
          <p className="callout__lead">
            <strong>{h.calloutLeadStrong}</strong>
            {h.calloutLeadRest}
            <span className="tabular-nums">{SITE.phoneDisplay}</span>{lang === 'bn' ? '।' : '.'}
          </p>
          <div className="links">
            <a className="btn btn--primary" href="#registration">
              {h.register}
            </a>
            <a className="btn" href={SITE.phoneTel}>
              {d.call}
            </a>
            <a className="btn" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
              {d.whatsapp}
            </a>
          </div>
        </aside>
      </section>

      <div className="stats" aria-label={h.statsAria}>
        <div className="stat">
          <p className="stat__fig">{num(lang, ALL_COURSES.length)}</p>
          <p className="stat__label">{h.statCourses}</p>
        </div>
        <div className="stat">
          <p className="stat__fig">{num(lang, COURSE_STREAMS.length)}</p>
          <p className="stat__label">{h.statStreams}</p>
        </div>
        <div className="stat">
          <p className="stat__fig">{num(lang, SITE.since)}</p>
          <p className="stat__label">{h.statSince}</p>
        </div>
        <div className="stat">
          <p className="stat__fig">{num(lang, 2)}</p>
          <p className="stat__label">{h.statBatches}</p>
        </div>
      </div>
    </>
  );
}
