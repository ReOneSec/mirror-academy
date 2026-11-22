'use client';

import Image from 'next/image';
import { SITE } from '@/lib/constants';
import { PhoneIcon, MapPinIcon } from '@/components/Icons';

export default function Hero() {
  return (
    <section className="relative bg-navy text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        {/* Logo — the ONE bold moment with animation */}
        <div className="hero-logo mb-6">
          <Image
            src="/brand/logo.jpg"
            alt="Mirror Academy logo — navy circle with gold M over white open book"
            width={160}
            height={160}
            className="rounded-full shadow-lg"
            priority
            fetchPriority="high"
          />
        </div>

        <h1 className="hero-text mb-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {SITE.name}
        </h1>

        <p className="hero-text mb-4 text-lg font-medium text-gold sm:text-xl">
          {SITE.tagline}
        </p>

        <p className="hero-text mb-2 text-base text-white/80 sm:text-lg">
          {SITE.focus} — Since {SITE.since}
        </p>

        <p className="hero-text mb-8 flex items-center gap-1.5 text-sm text-white/70">
          <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {SITE.address}
        </p>

        <div className="hero-text flex flex-col gap-3 sm:flex-row sm:gap-4">
          <a
            href="#enquiry"
            className="inline-flex items-center justify-center rounded-lg bg-gold px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-gold-hover focus-visible:ring-2 focus-visible:ring-white touch-action-manipulation"
          >
            Enquire now
          </a>
          <a
            href={SITE.phoneTel}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold touch-action-manipulation"
            aria-label={`Call ${SITE.phone}`}
          >
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            Call {SITE.phone}
          </a>
        </div>
      </div>

      {/* Hero animation — one orchestrated moment, respects reduced motion */}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          .hero-logo {
            animation: heroFadeScale 500ms ease-out both;
          }
          .hero-text {
            animation: heroFadeUp 400ms ease-out both;
          }
          .hero-text:nth-child(2) { animation-delay: 80ms; }
          .hero-text:nth-child(3) { animation-delay: 160ms; }
          .hero-text:nth-child(4) { animation-delay: 240ms; }
          .hero-text:nth-child(5) { animation-delay: 320ms; }
          .hero-text:nth-child(6) { animation-delay: 400ms; }
        }
        @keyframes heroFadeScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
