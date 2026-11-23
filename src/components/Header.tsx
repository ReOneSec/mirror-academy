'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SITE, NAV_LINKS } from '@/lib/constants';
import { PhoneIcon, MenuIcon, CloseIcon } from '@/components/Icons';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo + name */}
        <a href="#" className="flex items-center gap-3 focus-visible:outline-gold">
          <Image
            src="/brand/logo.jpg"
            alt="Mirror Academy logo"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
          <span className="text-lg font-bold tracking-tight">
            Mirror Academy
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 transition-colors hover:text-gold focus-visible:text-gold"
            >
              {link.label}
            </a>
          ))}
          <a
            href={SITE.phoneTel}
            className="flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-gold"
            aria-label={`Call ${SITE.phone}`}
          >
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">{SITE.phone}</span>
          </a>
          <a
            href="#registration"
            className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-navy transition-colors hover:bg-gold-hover focus-visible:ring-2 focus-visible:ring-white"
          >
            Register now
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg p-2 text-white md:hidden hover:bg-navy-light focus-visible:ring-2 focus-visible:ring-gold"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
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
          className="border-t border-white/10 bg-navy px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-white/90 hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={SITE.phoneTel}
            className="flex items-center gap-1.5 py-2 text-sm font-medium text-white/90 hover:text-gold"
            aria-label={`Call ${SITE.phone}`}
          >
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">{SITE.phone}</span>
          </a>
          <a
            href={SITE.emailMailto}
            className="flex items-center gap-1.5 py-2 text-sm font-medium text-white/90 hover:text-gold"
            aria-label={`Email ${SITE.email}`}
          >
            <span className="truncate">{SITE.email}</span>
          </a>
          <a
            href="#registration"
            className="mt-2 block rounded-lg bg-gold px-4 py-2 text-center text-sm font-bold text-navy hover:bg-gold-hover"
            onClick={() => setMenuOpen(false)}
          >
            Register now
          </a>
        </nav>
      )}
    </header>
  );
}
