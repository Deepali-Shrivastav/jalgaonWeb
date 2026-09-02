import type { MetadataRoute } from 'next';

async function fetchAll(url: string): Promise<any[]> {
  let results: any[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    try {
      const res: Response = await fetch(nextUrl, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const data = await res.json();
      if (data.results) {
        results = results.concat(data.results);
        nextUrl = data.next; // DRF pagination
      } else if (Array.isArray(data)) {
        results = results.concat(data);
        nextUrl = null;
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }
  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.jalgaon.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/jalgaon-glimpse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
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

    // 2. Fetch All Business Listings
    const listings = await fetchAll(`${apiUrl}/api/v1/listings/`);
    listings.forEach((listing: any) => {
      if (listing.id || listing.slug) {
        routes.push({
          url: `${baseUrl}/category/${listing.main_category_slug || 'business'}/${listing.slug || listing.id}`,
          lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });

    // 3. Fetch All News
    const news = await fetchAll(`${apiUrl}/api/v1/news/`);
    news.forEach((n: any) => {
        if (n.slug || n.id) {
            routes.push({
                url: `${baseUrl}/news/${n.slug || n.id}`,
                lastModified: n.updated_at || n.published_at || n.created_at ? new Date(n.updated_at || n.published_at || n.created_at) : new Date(),
                changeFrequency: 'daily',
                priority: 0.7,
            });
        }
    });

    // 4. Fetch YouTube Videos
    const videos = await fetchAll(`${apiUrl}/api/v1/jalgaon-glimpse/videos/?max_results=50`);
    videos.forEach((v: any) => {
      if (v.video_id) {
        routes.push({
          url: `${baseUrl}/jalgaon-glimpse/${v.video_id}`,
          lastModified: v.published_at ? new Date(v.published_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });

    // 5. Fetch All Events
    const events = await fetchAll(`${apiUrl}/api/v1/events/`);
    events.forEach((e: any) => {
        if (e.slug || e.id) {
            routes.push({
                url: `${baseUrl}/events/${e.slug || e.id}`,
                lastModified: e.updated_at || e.created_at ? new Date(e.updated_at || e.created_at) : new Date(),
                changeFrequency: 'daily',
                priority: 0.7,
            });
        }
    });

    // 6. Fetch All Jobs
    const jobs = await fetchAll(`${apiUrl}/api/v1/jobs/`);
    jobs.forEach((j: any) => {
        if (j.slug || j.id) {
            routes.push({
                url: `${baseUrl}/jobs/${j.slug || j.id}`,
                lastModified: j.updated_at || j.created_at ? new Date(j.updated_at || j.created_at) : new Date(),
                changeFrequency: 'daily',
                priority: 0.7,
            });
        }
    });
    
  } catch (err) {
    console.warn("Failed to generate dynamic sitemap entries:", err);
  }

  // Deduplicate routes by URL to avoid crawler warnings and save crawl budget
  const seenUrls = new Set<string>();
  const uniqueRoutes = routes.filter((route) => {
    if (seenUrls.has(route.url)) {
      return false;
    }
    seenUrls.add(route.url);
    return true;
  });

  return uniqueRoutes;
}
