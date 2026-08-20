import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: ['/', '/tree', '/learn/'],
      disallow: ['/admin', '/api/', '/auth/', '/dashboard', '/paths', '/roadmap', '/settings'],
    }],
    sitemap: 'https://app.getstacc.org/sitemap.xml',
    host: 'https://app.getstacc.org',
  };
}
