'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SITE, NAV_LINKS } from '@/lib/constants';
import ThemeToggle from './ThemeToggle';

/**
 * The kit's floating glass pill: logo, section tabs (the one in view is marked), a call
 * capsule on wider screens and the light/dark toggle. On a phone the tabs scroll sideways.
 */
export default function Header() {
  const [current, setCurrent] = useState<string>('');

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
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
  }, []);

  return (
    <header className="nav glass">
      <a href="#top" className="nav__brand" aria-label={`${SITE.name}, back to top`}>
        <Image src="/brand/logo-round.webp" alt="" width={88} height={88} priority />
        <span className="nav__word" aria-hidden="true">
          Mirror <b>Academy</b>
        </span>
      </a>
      <nav className="seg" aria-label="Sections">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={current === link.href.slice(1) ? 'true' : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <a href={SITE.phoneTel} className="nav__cta">
        Call {SITE.phoneDisplay}
      </a>
      <ThemeToggle />
    </header>
  );
}
