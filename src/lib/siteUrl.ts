/**
 * The site's public address, used for canonical links, the sitemap, robots.txt and Open Graph.
 * NEXT_PUBLIC_SITE_URL wins when it is a real address; a localhost value (left over from local
 * development) is ignored so search engines never see it.
 */
const DEFAULT_SITE_URL = 'https://www.themirroracademy.in';

function pick(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (!env || /localhost|127\.0\.0\.1/.test(env)) return DEFAULT_SITE_URL;
  return env;
}

export const SITE_URL = pick();
