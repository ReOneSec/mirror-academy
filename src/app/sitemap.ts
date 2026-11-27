import type { MetadataRoute } from 'next';
import { listArticles } from '@/lib/articlesData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mirroracademy.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listArticles(500);
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/bn`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/downloads`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'weekly', priority: 0.7 },
    ...articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
