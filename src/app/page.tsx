import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CourseStreams from '@/components/CourseStreams';
import WhyMirror from '@/components/WhyMirror';
import HowAdmission from '@/components/HowAdmission';
import LocationContact from '@/components/LocationContact';
import EnquiryForm from '@/components/EnquiryForm';
import Footer from '@/components/Footer';

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
          <CourseStreams />
          <WhyMirror />
          <HowAdmission />
          <EnquiryForm />
          <LocationContact />
        </main>
        <Footer />
      </div>
    </>
  );
}
