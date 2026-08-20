export const SITE_URL = 'https://app.getstacc.org';
export const SITE_NAME = 'Stacc Roadmap';

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
