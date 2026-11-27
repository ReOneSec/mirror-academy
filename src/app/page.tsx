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
import ArticlesSection from '@/components/ArticlesSection';
import MobileActionBar from '@/components/MobileActionBar';
import { SITE, ALL_COURSES } from '@/lib/constants';

// Tells search engines what Mirror Academy is and where, for local results and the map pack.
const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE.name,
  slogan: SITE.tagline,
  foundingDate: String(SITE.since),
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mirroracademy.in',
  logo: '/brand/logo.jpg',
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

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="page" id="top">
        <Header />
        <main id="main-content" className="main">
          <Hero />
          <NoticeBoard />
          <CourseStreams />
          <WhyMirror />
          <HowAdmission />
          <EnquiryForm />
          <ArticlesSection />
          <Faq />
          <LocationContact />
        </main>
        <Footer />
      </div>
      <MobileActionBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
    </>
  );
}
