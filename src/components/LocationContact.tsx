import { SITE } from '@/lib/constants';
import { PhoneIcon, MapPinIcon, ArrowUpRightIcon } from '@/components/Icons';

export default function LocationContact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-line bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            Contact
          </p>
          <h2
            id="contact-heading"
            className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl"
          >
            Location and contact
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Visit */}
          <address className="reveal relative isolate flex flex-col justify-between overflow-hidden rounded-3xl bg-navy-900 p-7 not-italic text-white sm:p-10">
            <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
            <div
              className="pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl"
              aria-hidden="true"
            />
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-navy-950">
                <MapPinIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
                Visit us
              </p>
              <p className="mt-3 max-w-lg font-display text-2xl font-medium leading-snug sm:text-3xl">
                {SITE.address}
              </p>
            </div>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-navy-950 transition hover:bg-gold-300"
            >
              Open in Google Maps
              <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </address>

          {/* Call */}
          <a
            href={SITE.phoneTel}
            className="reveal group flex flex-col justify-between rounded-3xl border border-line bg-paper p-7 transition hover:border-gold-400/70 hover:bg-white hover:shadow-[0_24px_48px_-28px_rgb(2_27_68/0.3)] sm:p-10"
            aria-label={`Call ${SITE.phone}`}
          >
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                <PhoneIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                Call us
              </p>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-navy-900 sm:text-4xl">
                {SITE.phoneDisplay}
              </p>
            </div>
            <span className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-navy-900">
              Tap to call
              <ArrowUpRightIcon className="h-4 w-4 text-gold-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
