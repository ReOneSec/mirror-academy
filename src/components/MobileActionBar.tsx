import { SITE } from '@/lib/constants';
import { getDict, type Lang } from '@/lib/i18n';

/** Phones only: Register, Call and WhatsApp stay in reach at the bottom of the screen. */
export default function MobileActionBar({ lang = 'en' }: { lang?: Lang }) {
  const d = getDict(lang);
  return (
    <nav className="actionbar glass" aria-label={d.actionbar.aria}>
      <a className="btn btn--primary" href="#registration">
        {d.actionbar.register}
      </a>
      <a className="btn" href={SITE.phoneTel}>
        {d.call}
      </a>
      <a className="btn" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
        {d.whatsapp}
      </a>
    </nav>
  );
}
