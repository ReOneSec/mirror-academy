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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Hero />
        <CourseStreams />
        <WhyMirror />
        <HowAdmission />
        <EnquiryForm />
        <LocationContact />
      </main>
      <Footer />
    </>
  );
}
