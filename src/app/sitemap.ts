import type { MetadataRoute } from 'next';
import { PATHS, PAUSED_PATH_IDS } from '@/config/roadmap';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/tree`, changeFrequency: 'weekly', priority: 0.9 },
    ...PATHS.filter((path) => !PAUSED_PATH_IDS.has(path.id)).map((path) => ({
      url: `${SITE_URL}/learn/${path.id}`,
      changeFrequency: 'monthly' as const,
      priority: path.id === 'foundations' ? 0.9 : 0.8,
    })),
  ];
}
