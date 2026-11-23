import { SITE } from '@/lib/constants';
import Icon from '@/components/icons/Icon';

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

          <div className="py-8 md:pl-12">
            <div className="flex items-center gap-3 text-muted">
              <Icon name="phone" size={24} />
              <h3 className="text-[1.0625rem] font-medium">Call</h3>
            </div>
            <a
              href={SITE.phoneTel}
              className="mt-4 inline-block text-4xl font-bold tabular-nums underline-offset-[6px] hover:underline hover:decoration-gold hover:decoration-[3px] sm:text-5xl"
            >
              <span className="sr-only">Call </span>
              {SITE.phoneDisplay}
            </a>
            <p className="mt-3 text-muted">Tap the number to call from your phone.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
