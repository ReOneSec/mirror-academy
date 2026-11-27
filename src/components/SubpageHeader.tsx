import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/constants';
import ThemeToggle from '@/components/ThemeToggle';

/** Header for pages other than the homepage: logo home, Articles, and the call button. */
export default function SubpageHeader() {
  return (
    <header className="nav glass">
      <Link href="/" className="nav__brand" aria-label={`${SITE.name} home`}>
        <Image src="/brand/logo-round.webp" alt="" width={88} height={88} priority />
        <span className="nav__word" aria-hidden="true">
          Mirror <b>Academy</b>
        </span>
      </Link>
      <nav className="seg" aria-label="Pages">
        <Link href="/">Home</Link>
        <Link href="/articles">Articles</Link>
        <Link href="/downloads">Downloads</Link>
        <Link href="/#registration">Register</Link>
      </nav>
      <a href={SITE.phoneTel} className="nav__cta">
        Call {SITE.phoneDisplay}
      </a>
      <ThemeToggle />
    </header>
  );
}
