import { Fragment, type ReactNode } from 'react';

/*
 * Renders article text written the WhatsApp way, without HTML:
 *   *bold* or **bold**     → bold
 *   # / ## / ### Heading   → heading
 *   ---                    → divider
 *   - item  or  • item     → bullet list
 *   blank line             → new paragraph (single line breaks are kept)
 *   https://…              → link
 * A stray * that has no partner on its line is dropped.
 */

const INLINE = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start).replace(/\*/g, ''));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith('http')) {
      out.push(
        <a key={key} href={tok} target="_blank" rel="noopener noreferrer" className="link">
          {tok}
        </a>
      );
    } else {
      const inner = tok.replace(/^\*+|\*+$/g, '');
      out.push(<strong key={key}>{inner}</strong>);
    }
    last = start + tok.length;
  }
  if (last < text.length) out.push(text.slice(last).replace(/\*/g, ''));
  return out;
}

function lines(block: string[], keyBase: string): ReactNode[] {
  return block.map((l, idx) => (
    <Fragment key={`${keyBase}-l${idx}`}>
      {idx > 0 && <br />}
      {inline(l, `${keyBase}-l${idx}`)}
    </Fragment>
  ));
}

export default function ArticleBody({ text }: { text: string }) {
  const src = text.replace(/\r\n?/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let k = 0;

  const flushPara = () => {
    if (para.length) {
      const key = `p${k++}`;
      nodes.push(<p key={key}>{lines(para, key)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const key = `u${k++}`;
      nodes.push(
        <ul key={key}>
          {list.map((item, idx) => (
            <li key={`${key}-${idx}`}>{inline(item, `${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of src) {
    const line = raw.trimEnd();
    const t = line.trim();
    if (!t) {
      flushPara();
      flushList();
      continue;
    }
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(t)) {
      flushPara();
      flushList();
      nodes.push(<hr key={`h${k++}`} />);
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(t);
    if (heading) {
      flushPara();
      flushList();
      const key = `t${k++}`;
      const content = inline(heading[2].replace(/^\*+|\*+$/g, ''), key);
      nodes.push(heading[1].length <= 2 ? <h2 key={key}>{content}</h2> : <h3 key={key}>{content}</h3>);
      continue;
    }
    const bullet = /^[-•]\s+(.*)$/.exec(t);
    if (bullet) {
      flushPara();
      list.push(bullet[1]);
      continue;
    }
    flushList();
    para.push(t);
  }
  flushPara();
  flushList();

  return <div className="prose art-body">{nodes}</div>;
}
