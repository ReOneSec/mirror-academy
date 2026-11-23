import { SITE } from '@/lib/constants';
import { PhoneIcon, MapPinIcon, MailIcon } from '@/components/Icons';

export default function LocationContact() {
  return (
    <section id="contact" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold text-navy sm:text-3xl">
          Location and contact
        </h2>

        <div className="flex flex-col gap-5 text-base text-ink">
          <div className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <p>{SITE.address}</p>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-medium text-navy underline underline-offset-2 hover:text-gold"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <a
              href={SITE.phoneTel}
              className="font-medium tabular-nums text-navy hover:text-gold"
              aria-label={`Call ${SITE.phone}`}
            >
              {SITE.phone}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <MailIcon className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <a
              href={SITE.emailMailto}
              className="font-medium text-navy hover:text-gold"
              aria-label={`Send email to ${SITE.email}`}
            >
              {SITE.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
