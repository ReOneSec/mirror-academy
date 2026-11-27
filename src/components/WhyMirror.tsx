import { getDict, type Lang } from '@/lib/i18n';

// TODO: confirm the "Enquiry-led admission" wording with the owner (text lives in src/lib/i18n.ts).
export default function WhyMirror({ lang = 'en' }: { lang?: Lang }) {
  const w = getDict(lang).why;
  return (
    <section id="why-mirror" className="section" aria-labelledby="why-heading">
      <div className="head">
        <p className="head__eyebrow">{w.eyebrow}</p>
        <h2 id="why-heading">{w.heading}</h2>
      </div>
      <div className="cards">
        {w.reasons.map(({ title, body }) => (
          <div key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
