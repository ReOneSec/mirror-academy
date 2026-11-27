import { getDict, num, type Lang } from '@/lib/i18n';

// TODO: confirm steps 2 and 3 wording with the owner (text lives in src/lib/i18n.ts).
export default function HowAdmission({ lang = 'en' }: { lang?: Lang }) {
  const a = getDict(lang).admission;
  return (
    <section id="admission" className="section" aria-labelledby="admission-heading">
      <div className="head">
        <p className="head__eyebrow">{a.eyebrow}</p>
        <h2 id="admission-heading">{a.heading}</h2>
      </div>
      <ol className="steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {a.steps.map(({ eyebrow, title, body }, i) => (
          <li key={title} className="step">
            <div className="step__intro">
              <p className="step__num" aria-hidden="true">
                {num(lang, String(i + 1).padStart(2, '0'))}
              </p>
              <p className="step__eyebrow">{eyebrow}</p>
            </div>
            <div>
              <h3>
                <span className="sr-only">{a.stepLabel(i + 1)}</span>
                {title}
              </h3>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <a className="btn btn--primary btn--lg" href="#registration">
        {a.start}
      </a>
    </section>
  );
}
