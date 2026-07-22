import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.jalgaon.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/account/',
        '/forgot-password/',
        '/edit-listing/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
