import { SITE } from '@/lib/constants';

export default function LocationContact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-heading">
      <div className="head">
        <p className="head__eyebrow">Contact</p>
        <h2 id="contact-heading">Call, write or drop by in Gorabazar.</h2>
      </div>

      <div className="cards">
        <div>
          <h3>Phone</h3>
          <p>
            <a className="link big-link" href={SITE.phoneTel}>
              <span className="sr-only">Call </span>
              {SITE.phoneDisplay}
            </a>
          </p>
          <p className="sub" style={{ marginTop: 6 }}>
            Tap to call, or message us on{' '}
            <a className="link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            .
          </p>
        </div>
        <div>
          <h3>Email</h3>
          <p>
            <a className="link" href={SITE.emailMailto}>
              {SITE.email}
            </a>
          </p>
          <p className="sub" style={{ marginTop: 6 }}>
            Write to us for enquiries and batch details.
          </p>
        </div>
        <div>
          <h3>Address</h3>
          <address style={{ fontStyle: 'normal' }}>{SITE.address}</address>
          <p style={{ marginTop: 12 }}>
            <a className="btn" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
              Directions
            </a>
          </p>
        </div>
      </div>

      <div className="map">
        <div className="map__bar">
          <span>Mirror Academy on Google Maps, near Rallis Mess, Berhampore</span>
          <a className="link" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <iframe
          src={SITE.mapsEmbedUrl}
          title="Mirror Academy location on Google Maps"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <aside className="callout" aria-label="Admissions">
        <p className="callout__head">Admissions open</p>
        <p className="callout__lead">
          <strong>Ready to start?</strong> Register online, or call or WhatsApp us.
        </p>
        <div className="links">
          <a className="btn btn--primary" href="#registration">
            Register as a student
          </a>
          <a className="btn" href={SITE.phoneTel}>
            Call {SITE.phoneDisplay}
          </a>
          <a className="btn" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
      </aside>
    </section>
  );
}
