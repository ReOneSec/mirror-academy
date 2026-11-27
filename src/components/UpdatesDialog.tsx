'use client';

import { useEffect, useRef, useState } from 'react';
import { getDict, homePath, type Lang } from '@/lib/i18n';

export interface PopupNotice {
  id: string;
  title: string;
  date: string;
  isNew: boolean;
}
export interface PopupDate {
  id: string;
  exam: string;
  kind: string;
  date: string;
  when: string;
}

const HIDE_KEY = 'ma-updates-hidden-on';

/**
 * Opens shortly after each page load with the latest notices and exam dates. "Don't show again
 * today" keeps it closed until tomorrow on this device.
 */
export default function UpdatesDialog({
  lang,
  notices,
  dates,
  today,
}: {
  lang: Lang;
  notices: PopupNotice[];
  dates: PopupDate[];
  today: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [hideToday, setHideToday] = useState(false);
  const t = getDict(lang);
  const p = t.popup;

  useEffect(() => {
    try {
      if (localStorage.getItem(HIDE_KEY) === today) return;
    } catch {
      /* private mode: show it */
    }
    // Don't open over a link that jumps to a section (e.g. #registration from a share).
    if (window.location.hash && window.location.hash !== '#top') return;
    const timer = window.setTimeout(() => {
      const d = ref.current;
      if (d && !d.open && typeof d.showModal === 'function') d.showModal();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [today]);

  function close() {
    if (hideToday) {
      try {
        localStorage.setItem(HIDE_KEY, today);
      } catch {
        /* ignore */
      }
    }
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      className="upd"
      aria-labelledby="upd-title"
      onClick={(e) => {
        if (e.target === ref.current) close(); // tap on the backdrop
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="upd__card">
        <div className="upd__head">
          <h2 id="upd-title">{p.title}</h2>
          <button type="button" className="upd__x" onClick={close} aria-label={p.close}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="upd__body">
          {notices.length > 0 && (
            <section aria-labelledby="upd-notices">
              <h3 id="upd-notices" className="upd__label">
                {p.notices}
              </h3>
              <ul className="upd__list">
                {notices.map((n) => (
                  <li key={n.id}>
                    <a href={`${homePath(lang)}#notices`} onClick={close} className="upd__item">
                      <span className="upd__meta">
                        {n.date}
                        {n.isNew && <span className="chip nb-new">{t.notices.new}</span>}
                      </span>
                      <span className="upd__title">{n.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dates.length > 0 && (
            <section aria-labelledby="upd-dates">
              <h3 id="upd-dates" className="upd__label">
                {p.dates}
              </h3>
              <ul className="upd__list">
                {dates.map((d) => (
                  <li key={d.id}>
                    <a href={`${homePath(lang)}#calendar`} onClick={close} className="upd__item">
                      <span className="upd__meta">
                        {d.kind} · {d.date}
                        <span className="chip">{d.when}</span>
                      </span>
                      <span className="upd__title">{d.exam}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="upd__foot">
          <label className="upd__check">
            <input type="checkbox" checked={hideToday} onChange={(e) => setHideToday(e.target.checked)} />
            {p.hideToday}
          </label>
          <div className="upd__actions">
            <a href={`${homePath(lang)}#notices`} className="btn btn--primary" onClick={close}>
              {p.seeAll}
            </a>
            <button type="button" className="btn" onClick={close}>
              {p.close}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
