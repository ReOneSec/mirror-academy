import Link from 'next/link';
import { SITE } from '@/lib/constants';
import { getDict, navLinks, type Lang } from '@/lib/i18n';
import DynamicYear from '@/components/DynamicYear';

/** `linkBase="/"` on pages other than the homepage, so section links go back to it. */
export default function Footer({ linkBase = '', lang = 'en' }: { linkBase?: string; lang?: Lang }) {
  const d = getDict(lang);
  return (
    <footer className="foot flex-col gap-6 pt-6 pb-10">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <p>
          <strong>{SITE.name}</strong>, Berhampore · {SITE.tagline}
        </p>
        <nav aria-label={d.footer.back}>
          {navLinks(lang).map((link) => (
            <a key={link.href} href={`${linkBase}${link.href}`}>
              {link.label}
            </a>
          ))}
          <Link href="/admin" className="link text-xs">
            {d.footer.admin}
          </Link>
        </nav>
      </div>

      <div className="foot__disclaimer">
        <p>
          Disclaimer: Site Contents designed, developed, maintained and updated by{' '}
          <a
            href="https://epplicon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="foot__credit"
          >
            Epplicon Technologies
          </a>
        </p>
        <p>
          Official Site of Mirror Academy &nbsp;|&nbsp; Copyright <DynamicYear />, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
