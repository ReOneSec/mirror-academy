'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { SITE } from '@/lib/constants';
import { PRIMARY_SECTIONS, getDict, homePath, navLinks, type Lang } from '@/lib/i18n';
import ThemeToggle from './ThemeToggle';
import Motion from './Motion';

/**
 * The floating glass pill. Wide screens: logo, the main section tabs (the one in view is
 * marked), Register, language and theme. Narrower screens: logo, language, theme and a Menu
 * button that opens every section, plus Call and WhatsApp, in a sheet under the pill.
 * On pages other than the homepage, pass `base="/"` (or "/bn") so links go back to it.
 */
export default function Header({ lang = 'en', base = '' }: { lang?: Lang; base?: string }) {
  const [current, setCurrent] = useState<string>('');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const links = navLinks(lang);
  const primary = links.filter((l) => PRIMARY_SECTIONS.includes(l.href));
  const d = getDict(lang);
  const other: Lang = lang === 'en' ? 'bn' : 'en';

  useEffect(() => {
    if (base) return;
    const ids = navLinks('en').map((l) => l.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = ids.find((id) => seen.get(id));
        setCurrent(first ?? '');
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [base]);

  // Slide the highlight pill under the tab whose section is in view.
  useEffect(() => {
    const pill = pillRef.current;
    const tabs = tabsRef.current;
    if (!pill || !tabs) return;
    const active = tabs.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!active) {
      pill.style.opacity = '0';
      return;
    }
    pill.style.opacity = '1';
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.transform = `translateX(${active.offsetLeft}px)`;
  }, [current]);

  // Close the menu on Escape or a tap outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <header className="nav glass" data-open={open || undefined}>
      <Motion />
      <a href={base ? base : '#top'} className="nav__brand" aria-label={`${SITE.name}, ${base ? d.home : 'back to top'}`}>
        <Image src="/brand/logo-round.webp" alt="" width={88} height={88} priority />
        <span className="nav__word" aria-hidden="true">
          Mirror <b>Academy</b>
        </span>
      </a>
      <nav ref={tabsRef} className="seg nav__tabs" aria-label={d.navAria}>
        <span ref={pillRef} className="nav__pill" aria-hidden="true" />
        {primary.map((link) => (
          <a
            key={link.href}
            href={`${base}${link.href}`}
            aria-current={current === link.href.slice(1) ? 'true' : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <span className="nav__spacer" />
      <a href={`${base}#registration`} className="nav__cta">
        {d.nav.register}
      </a>
      <a
        href={homePath(other)}
        className="nav__lang"
        hrefLang={other}
        lang={other}
        aria-label={d.langSwitch.aria}
      >
        {d.langSwitch.label}
      </a>
      <ThemeToggle />
      <button
        ref={btnRef}
        type="button"
        className="nav__menu-btn"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav__burger" aria-hidden="true" />
        <span className="sr-only">{open ? d.close : d.menu}</span>
      </button>

      <div id="site-menu" ref={menuRef} className="nav__sheet" hidden={!open}>
        <nav aria-label={d.navAria}>
          <ul className="nav__sheet-links">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={`${base}${link.href}`}
                  aria-current={current === link.href.slice(1) ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__sheet-actions">
          <a className="btn btn--primary" href={`${base}#registration`} onClick={() => setOpen(false)}>
            {d.hero.register}
          </a>
          <a className="btn" href={SITE.phoneTel} aria-label={`${d.call} ${SITE.phoneDisplay}`}>
            {d.call}
          </a>
          <a className="btn" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
            {d.whatsapp}
          </a>
        </div>
      </div>
    </header>
  );
}
