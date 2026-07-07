import type { MetadataRoute } from 'next';

const BASE = 'https://app.getstacc.org';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/tree`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/paths`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
