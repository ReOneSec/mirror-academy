import { SITE } from '@/lib/constants';
import MapEmbed from '@/components/MapEmbed';
import { getDict, type Lang } from '@/lib/i18n';

export default function LocationContact({ lang = 'en' }: { lang?: Lang }) {
  const c = getDict(lang).contact;
  const d = getDict(lang);
  return (
    <section id="contact" className="section" aria-labelledby="contact-heading">
      <div className="head">
        <p className="head__eyebrow">{c.eyebrow}</p>
        <h2 id="contact-heading">{c.heading}</h2>
      </div>

      <div className="cards">
        <div>
          <h3>{c.phone}</h3>
          <p>
            <a className="link big-link" href={SITE.phoneTel}>
              <span className="sr-only">{d.call} </span>
              {SITE.phoneDisplay}
            </a>
          </p>
          <p className="sub" style={{ marginTop: 6 }}>
            {c.phoneSub}
            <a className="link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
              {d.whatsapp}
            </a>
            {lang === 'bn' ? '।' : '.'}
          </p>
        </div>
        <div>
          <h3>{c.email}</h3>
          <p>
            <a className="link" href={SITE.emailMailto}>
              {SITE.email}
            </a>
          </p>
          <p className="sub" style={{ marginTop: 6 }}>
            {c.emailSub}
          </p>
        </div>
        <div>
          <h3>{c.address}</h3>
          <address style={{ fontStyle: 'normal' }}>{SITE.address}</address>
          <p style={{ marginTop: 12 }}>
            <a className="btn" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
              {c.directions}
            </a>
          </p>
        </div>
      </div>

      <div className="map">
        <div className="map__bar">
          <span>{c.mapBar}</span>
          <a className="link" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
            {c.openMaps}<span className="sr-only">{c.newTab}</span>
          </a>
        </div>
        <MapEmbed src={SITE.mapsEmbedUrl} title={c.mapTitle} address={SITE.address} label={c.showMap} />
      </div>

      <aside className="callout" aria-label={c.calloutHead}>
        <p className="callout__head">{c.calloutHead}</p>
        <p className="callout__lead">
          <strong>{c.calloutStrong}</strong>
          {c.calloutRest}
        </p>
        <div className="links">
          <a className="btn btn--primary" href="#registration">
            {d.hero.register}
          </a>
          <a className="btn" href={SITE.phoneTel}>
            {d.call} {SITE.phoneDisplay}
          </a>
          <a className="btn" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
            {d.whatsapp}
          </a>
        </div>
      </aside>
    </section>
  );
}
