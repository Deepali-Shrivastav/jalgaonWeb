import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.jalgaon.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/ngo`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/tourism`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    // 1. Fetch Categories
    const categoriesRes = await fetch(`${apiUrl}/api/v1/listings/categories/`, { next: { revalidate: 86400 } });
    if (categoriesRes.ok) {
        const cats = await categoriesRes.json();
        cats.forEach((cat: any) => {
            if (cat.slug || cat.main_category) {
                routes.push({
                    url: `${baseUrl}/category/${cat.slug || cat.main_category}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.9,
                });
            }
        });
    }

    // 2. Fetch Business Listings
    const listingsRes = await fetch(`${apiUrl}/api/v1/listings/`, { next: { revalidate: 3600 } });
    if (listingsRes.ok) {
      const data = await listingsRes.json();
      const listings = data.results || data.data || data || [];
      listings.forEach((listing: any) => {
        if (listing.id || listing.slug) {
          routes.push({
            url: `${baseUrl}/directory/${listing.slug || listing.id}`,
            lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }

    // 3. Fetch Trending News
    const newsRes = await fetch(`${apiUrl}/api/v1/news/trending/`, { next: { revalidate: 3600 } });
    if (newsRes.ok) {
        const data = await newsRes.json();
        const news = data.results || data.data || data || [];
        news.forEach((n: any) => {
            if (n.slug || n.id) {
                routes.push({
                    url: `${baseUrl}/news/${n.slug || n.id}`,
                    lastModified: n.published_at || n.created_at ? new Date(n.published_at || n.created_at) : new Date(),
                    changeFrequency: 'daily',
                    priority: 0.7,
                });
            }
        });
    }
    
  } catch (err) {
    console.warn("Failed to generate dynamic sitemap entries:", err);
  }

  return routes;
}
