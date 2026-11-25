import { SITE } from '@/lib/constants';

/** Phones only: Register, Call and WhatsApp stay in reach at the bottom of the screen. */
export default function MobileActionBar() {
  return (
    <nav className="actionbar glass" aria-label="Quick actions">
      <a className="btn btn--primary" href="#registration">
        Register
      </a>
      <a className="btn" href={SITE.phoneTel}>
        Call
      </a>
      <a className="btn" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
    </nav>
  );
}
