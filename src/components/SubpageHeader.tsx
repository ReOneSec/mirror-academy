import Header from '@/components/Header';
import type { Lang } from '@/lib/i18n';

/** Header for pages other than the homepage: the same header, with links back to the homepage. */
export default function SubpageHeader({ lang = 'en' }: { lang?: Lang }) {
  return <Header lang={lang} base={lang === 'bn' ? '/bn' : '/'} />;
}
