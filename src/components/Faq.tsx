import { SITE } from '@/lib/constants';
import { getDict, type Lang } from '@/lib/i18n';

// Every answer restates what the site already says; nothing new is promised here.
export default function Faq({ lang = 'en' }: { lang?: Lang }) {
  const f = getDict(lang).faq;
  const items = f.items(SITE.phoneDisplay, SITE.email, SITE.address);
  return (
    <section id="faq" className="section" aria-labelledby="faq-heading">
      <div className="head">
        <p className="head__eyebrow">{f.eyebrow}</p>
        <h2 id="faq-heading">{f.heading}</h2>
      </div>
      <div className="faq">
        {items.map(({ q, a }) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
