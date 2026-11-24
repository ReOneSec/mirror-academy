import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Mirror Academy Berhampore',
  description: 'Administrative portal for student registrations and admissions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The admin portal keeps its own light, utility-built styling whatever the site theme.
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" style={{ colorScheme: 'light' }}>
      {children}
    </div>
  );
}
