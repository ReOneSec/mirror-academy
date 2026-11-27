import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { en: '/', bn: '/bn' } },
};

export default function Home() {
  return <HomePage lang="en" />;
}
