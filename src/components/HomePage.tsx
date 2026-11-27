import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CourseStreams from '@/components/CourseStreams';
import WhyMirror from '@/components/WhyMirror';
import HowAdmission from '@/components/HowAdmission';
import LocationContact from '@/components/LocationContact';
import EnquiryForm from '@/components/EnquiryForm';
import Footer from '@/components/Footer';
import Faq from '@/components/Faq';
import NoticeBoard from '@/components/NoticeBoard';
import ExamCalendar from '@/components/ExamCalendar';
import DownloadsSection from '@/components/DownloadsSection';
import ArticlesSection from '@/components/ArticlesSection';
import MobileActionBar from '@/components/MobileActionBar';
import UpdatesPopup from '@/components/UpdatesPopup';
import { SITE, ALL_COURSES } from '@/lib/constants';
import { SITE_URL } from '@/lib/siteUrl';
import { getDict, type Lang } from '@/lib/i18n';

// Tells search engines what Mirror Academy is and where, for local results and the map pack.
const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE.name,
  slogan: SITE.tagline,
  foundingDate: String(SITE.since),
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.jpg`,
  image: `${SITE_URL}/brand/logo.jpg`,
  telephone: `+91${SITE.phone}`,
  email: SITE.email,
  hasMap: SITE.mapsUrl,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Jamindari Koshaikhana more, Majdia West, Gorabazar',
    addressLocality: 'Berhampore',
    addressRegion: 'West Bengal',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 24.0821424, longitude: 88.241972 },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Courses',
    itemListElement: ALL_COURSES.map((c) => ({
      '@type': 'Course',
      name: c.name,
      ...(c.about ? { description: c.about } : {}),
      provider: { '@type': 'EducationalOrganization', name: SITE.name },
    })),
  },
};

/** FAQ answers, marked up so Google can show them under the result. */
function faqSchema(lang: Lang) {
  const items = getDict(lang).faq.items(SITE.phoneDisplay, SITE.email, SITE.address);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang === 'bn' ? 'bn' : 'en',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** The one-page site, in English (/) or Bengali (/bn). */
export default function HomePage({ lang }: { lang: Lang }) {
  return (
    <div lang={lang} className={lang === 'bn' ? 'lang-bn' : undefined}>
      <a href="#main-content" className="skip-link">
        {getDict(lang).skip}
      </a>
      <div className="page" id="top">
        <Header lang={lang} />
        <main id="main-content" className="main">
          <Hero lang={lang} />
          <div className="duo">
            <NoticeBoard lang={lang} />
            <ExamCalendar lang={lang} />
          </div>
          <CourseStreams lang={lang} />
          <WhyMirror lang={lang} />
          <HowAdmission lang={lang} />
          <EnquiryForm lang={lang} />
          <DownloadsSection lang={lang} />
          <ArticlesSection lang={lang} />
          <Faq lang={lang} />
          <LocationContact lang={lang} />
        </main>
        <Footer lang={lang} />
      </div>
      <MobileActionBar lang={lang} />
      <UpdatesPopup lang={lang} />
      {lang === 'en' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(lang)) }} />
    </div>
  );
}
