import type { Metadata } from 'next';
import Motion from '@/components/Motion';

export const metadata: Metadata = {
  title: 'Admin Portal | Mirror Academy Berhampore',
  description: 'Administrative portal for student registrations and admissions.',
  robots: {
    index: false,
    follow: false,
  },
};

// The admin portal uses the same kit, theme and light/dark toggle as the public site.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Motion />
      {children}
    </>
  );
}
