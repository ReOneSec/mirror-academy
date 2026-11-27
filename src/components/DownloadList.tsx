import { DOWNLOAD_CATEGORIES, formatSize } from '@/lib/downloads';
import { getDict, num, type Lang } from '@/lib/i18n';
import type { DownloadItem } from '@/types';

/** Downloads grouped by section (syllabus, previous papers, study material, notifications). */
export default function DownloadList({ items, lang, headingLevel = 3 }: { items: DownloadItem[]; lang: Lang; headingLevel?: 2 | 3 }) {
  const t = getDict(lang).downloads;
  if (items.length === 0) return <p className="nb-empty">{t.empty}</p>;
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const groups = DOWNLOAD_CATEGORIES.map((c) => ({ c, list: items.filter((i) => i.category === c) })).filter(
    (g) => g.list.length > 0
  );
  return (
    <div className="dl-groups">
      {groups.map(({ c, list }) => (
        <div key={c} className="dl-group">
          <H className="dl-group__title">
            {t.categories[c]} <span className="card__count">{num(lang, list.length)}</span>
          </H>
          <ul className="dl-list">
            {list.map((d) => {
              const href = d.fileUrl ?? d.linkUrl ?? '#';
              const isPdf = d.fileType === 'application/pdf' || /\.pdf/i.test(d.linkUrl ?? '');
              return (
                <li key={d.id} className="dl-item">
                  <span className="dl-icon" aria-hidden="true">
                    {isPdf ? 'PDF' : d.fileUrl ? 'IMG' : 'LINK'}
                  </span>
                  <span className="dl-text">
                    <span className="dl-title">{d.title}</span>
                    {(d.exam || d.fileSize) && (
                      <span className="dl-meta">
                        {[d.exam, d.fileSize ? formatSize(d.fileSize) : null].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                  <a
                    href={href}
                    className="btn dl-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...(d.fileUrl ? { download: d.fileName ?? '' } : {})}
                  >
                    {d.fileUrl ? t.download : t.open}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
