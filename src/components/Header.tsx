'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SITE, NAV_LINKS } from '@/lib/constants';
import { PhoneIcon, MenuIcon, CloseIcon, ArrowRightIcon } from '@/components/Icons';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
      className={`sticky top-0 z-50 text-white transition-[background-color,box-shadow,border-color] duration-300 ${
        menuOpen
          ? 'border-b border-white/10 bg-navy-950 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5)]'
          : scrolled
            ? 'border-b border-white/10 bg-navy-950/85 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl'
            : 'border-b border-transparent bg-navy-900'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <a href="#" className="group flex items-center gap-3" aria-label={`${SITE.name} — home`}>
          <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-gold-400/60 transition group-hover:ring-gold-400">
            <Image
              src="/brand/logo.jpg"
              alt=""
              width={80}
              height={80}
              className="h-full w-full scale-[1.06] object-cover"
              priority
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">
              {SITE.name}
            </span>
            <span className="mt-1 hidden text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-300/90 sm:block">
              Berhampore · Since {SITE.since}
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={SITE.phoneTel}
            className="flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-gold-300"
            aria-label={`Call ${SITE.phone}`}
          >
            <PhoneIcon className="h-4 w-4 text-gold-400" aria-hidden="true" />
            <span className="tabular-nums lg:inline">{SITE.phone}</span>
          </a>
          <a
            href="#enquiry"
            className="group inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-navy-950 shadow-[0_6px_20px_-6px_rgb(255_197_1/0.6)] transition hover:-translate-y-px hover:bg-gold-300"
          >
            Enquire now
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? (
            <CloseIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="anim-menu border-t border-white/10 px-4 pb-6 pt-3 md:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center justify-between border-b border-white/5 py-3.5 text-base font-medium text-white/90 hover:text-gold-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <ArrowRightIcon className="h-4 w-4 text-white/40" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href={SITE.phoneTel}
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:border-white/40"
              aria-label={`Call ${SITE.phone}`}
            >
              <PhoneIcon className="h-4 w-4 text-gold-400" aria-hidden="true" />
              Call us
            </a>
            <a
              href="#enquiry"
              className="flex items-center justify-center rounded-full bg-gold-400 px-4 py-3 text-sm font-bold text-navy-950 hover:bg-gold-300"
              onClick={() => setMenuOpen(false)}
            >
              Enquire now
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
