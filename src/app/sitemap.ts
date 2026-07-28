import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://goldtradingboot.shop';

  // Routes publiques principales qui doivent être indexées
  const routes = [
    '',
    '/login',
    '/register',
    '/forgot-password',
    '/privacy',
    '/terms',
    '/risk'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
