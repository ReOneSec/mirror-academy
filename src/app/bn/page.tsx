import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: 'মিরর অ্যাকাডেমি, বহরমপুর | Reflect Your Strength!',
  description:
    'বহরমপুরে WBPSC, WBCS, পুলিশ, মেডিক্যাল ও ইঞ্জিনিয়ারিং, শিক্ষকতা এবং মক ইন্টারভিউয়ের কোচিং। অনলাইনে রেজিস্টার করুন।',
  alternates: { canonical: '/bn', languages: { en: '/', bn: '/bn' } },
  openGraph: { locale: 'bn_IN' },
};

export default function HomeBengali() {
  return <HomePage lang="bn" />;
}
