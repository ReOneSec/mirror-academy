import { SITE } from '@/lib/constants';
import Icon from '@/components/icons/Icon';
import { MailIcon } from '@/components/Icons';

export default function LocationContact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-rule bg-sheet py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          id="contact-heading"
          className="w-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
        >
          Location and Contact
        </h2>

        <div className="mt-12 grid border-t border-rule md:grid-cols-[1.4fr_1fr]">
          <address className="border-b border-rule py-8 not-italic md:border-b-0 md:border-r md:pr-12">
            <div className="flex items-center gap-3 text-muted">
              <Icon name="map" size={24} />
              <h3 className="text-[1.0625rem] font-medium">Visit</h3>
            </div>
            <p className="mt-4 max-w-lg text-2xl font-medium leading-snug sm:text-[1.75rem]">
              {SITE.address}
            </p>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2.5 rounded-md border border-ink px-5 py-3 font-semibold transition-colors hover:bg-ink hover:text-white hover:[--ki-a:#ffc501] hover:[--ki-b:#ffe899]"
            >
              Open in Google Maps
              <Icon name="external-link" size={20} />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </address>

          <div className="py-8 md:pl-12 space-y-8">
            <div>
              <div className="flex items-center gap-3 text-muted">
                <Icon name="phone" size={24} />
                <h3 className="text-[1.0625rem] font-medium">Call</h3>
              </div>
              <a
                href={SITE.phoneTel}
                className="mt-4 inline-block text-3xl font-bold tabular-nums underline-offset-[6px] hover:underline hover:decoration-gold hover:decoration-[3px] sm:text-4xl text-ink"
              >
                <span className="sr-only">Call </span>
                {SITE.phoneDisplay}
              </a>
              <p className="mt-2 text-sm text-muted">Tap the number to call from your phone.</p>
            </div>

            <div>
              <div className="flex items-center gap-3 text-muted">
                <MailIcon className="h-5 w-5 text-gold" aria-hidden="true" />
                <h3 className="text-[1.0625rem] font-medium">Email</h3>
              </div>
              <a
                href={SITE.emailMailto}
                className="mt-3 inline-block text-xl font-bold underline-offset-[4px] hover:underline hover:decoration-gold text-ink"
                aria-label={`Send email to ${SITE.email}`}
              >
                {SITE.email}
              </a>
              <p className="mt-1 text-sm text-muted">Write to us for enquiries and batch details.</p>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Google Map */}
        <div className="mt-10 overflow-hidden rounded-xl border border-rule bg-paper shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-sheet px-5 py-3.5 text-sm">
            <div className="flex items-center gap-2.5 font-medium text-ink">
              <Icon name="map" size={20} />
              <span>Mirror Academy on Google Maps &mdash; Rallis Mess, Berhampore</span>
            </div>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-ink transition-colors hover:text-gold text-xs uppercase tracking-wider"
            >
              Open in Google Maps
              <Icon name="external-link" size={16} />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <div className="relative w-full h-[360px] sm:h-[420px]">
            <iframe
              src={SITE.mapsEmbedUrl}
              title="Mirror Academy Google Map Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
