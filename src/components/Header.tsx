'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SITE, NAV_LINKS } from '@/lib/constants';
import Icon from '@/components/icons/Icon';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => {
      if (mq.matches) setMenuOpen(false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  return (
    <header
      className={`on-ink sticky top-0 z-50 bg-ink text-white transition-[border-color] duration-200 border-b ${
        scrolled || menuOpen ? 'border-white/15' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label={`${SITE.name}, back to top`}>
          <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/brand/logo.jpg"
              alt=""
              width={40}
              height={40}
              className="h-full w-full scale-[1.08] object-cover"
              priority
            />
          </span>
          <span translate="no" className="w-display text-lg font-bold leading-none tracking-tight">
            {SITE.name}
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.95rem] font-medium text-white/80 underline-offset-[6px] transition-colors hover:text-white hover:underline hover:decoration-gold hover:decoration-2"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <a
            href={SITE.phoneTel}
            className="text-[0.95rem] font-medium tabular-nums text-white/85 underline-offset-[6px] transition-colors hover:text-white hover:underline hover:decoration-gold hover:decoration-2"
          >
            <span className="sr-only">Call </span>
            {SITE.phoneDisplay}
          </a>
          <a
            href="#registration"
            className="rounded-md bg-gold px-4 py-2.5 text-[0.95rem] font-bold text-ink transition-colors hover:bg-gold-2"
          >
            Register now
          </a>
        </div>

        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-ink-2 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <Icon name={menuOpen ? 'circle-x' : 'menu'} size={24} />
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-white/15 px-5 pb-6 pt-2 md:hidden"
          aria-label="Mobile"
        >
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-white/10">
                <a
                  href={link.href}
                  className="block py-3.5 text-lg font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href={SITE.phoneTel}
              className="flex items-center justify-center gap-2 rounded-md border border-white/30 px-4 py-3 font-semibold transition-colors hover:border-white/60"
            >
              <Icon name="phone" size={20} />
              Call Now
            </a>
            <a
              href="#registration"
              className="flex items-center justify-center rounded-md bg-gold px-4 py-3 font-bold text-ink transition-colors hover:bg-gold-2"
              onClick={() => setMenuOpen(false)}
            >
              Register now
            </a>
          </div>
          <div className="mt-3 text-center">
            <a
              href={SITE.emailMailto}
              className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-gold"
            >
              <span>{SITE.email}</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
