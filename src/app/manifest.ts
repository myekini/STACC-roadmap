import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stacc Roadmap',
    short_name: 'Stacc',
    description: 'Your focused roadmap for shipping real data-career work.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0a1628',
    theme_color: '#0a1628',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/pwa-icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Continue roadmap', short_name: 'Roadmap', url: '/roadmap', icons: [{ src: '/pwa-icon-192', sizes: '192x192' }] },
      { name: 'View progress', short_name: 'Progress', url: '/dashboard', icons: [{ src: '/pwa-icon-192', sizes: '192x192' }] },
    ],
  };
}
