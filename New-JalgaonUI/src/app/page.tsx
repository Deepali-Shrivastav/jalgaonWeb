import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeClient from '@/components/HomeClient';

async function getHomeData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const [trendingRes, newsRes, eventsRes, jobsRes, startupsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/api/v1/listings/trending/`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/api/v1/news/trending/`, { next: { revalidate: 1800 } }),
      fetch(`${apiUrl}/api/v1/events/`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/api/v1/jobs/`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/api/v1/startups/featured/`, { next: { revalidate: 3600 } }),
    ]);

    const getJson = async (res: PromiseSettledResult<Response>) => {
      if (res.status === 'fulfilled' && res.value.ok) {
        try {
          const data = await res.value.json();
          return data.results || data.data || data || [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const trendingListings = await getJson(trendingRes);
    const news = await getJson(newsRes);
    
    let events = await getJson(eventsRes);
    events = events.slice(0, 4).map((item: any) => {
      const startDate = item.start_datetime ? new Date(item.start_datetime) : new Date();
      return {
        id: item.id,
        slug: item.slug,
        month: startDate.toLocaleString('en-US', { month: 'short' }),
        day: startDate.getDate().toString().padStart(2, '0'),
        isoDate: item.start_datetime || '',
        title: item.title,
        location: item.venue_name || item.venue_address || 'TBA',
        venue: item.venue_name || item.venue_address || 'TBA'
      };
    });

    const jobs = await getJson(jobsRes);
    const slicedJobs = jobs.slice(0, 3);
    const startups = await getJson(startupsRes);
    const slicedStartups = startups.slice(0, 4);

    const mappedListings = trendingListings.map((item: any) => ({
      id: item.slug || item.id,
      name: item.business_name,
      category: item.main_category_name || 'Business',
      categorySlug: item.main_category_slug || '',
      rating: item.avg_rating || 4.0,
      location: item.city || 'Jalgaon',
      image: item.business_banner
        ? (item.business_banner.startsWith('http')
          ? item.business_banner
          : `${apiUrl}${item.business_banner.startsWith('/') ? '' : '/'}${item.business_banner}`)
        : '',
      verified: true
    }));

    return { 
      trendingListings: mappedListings, 
      news, 
      events, 
      jobs: slicedJobs,
      startups: slicedStartups
    };
  } catch (err) {
    return { trendingListings: [], news: [], events: [], jobs: [], startups: [] };
  }
}

export default async function Home() {
  const { trendingListings, news, events, jobs, startups } = await getHomeData();

  return (
    <>
      <Header />
      <main>
        <HomeClient 
          trendingListings={trendingListings} 
          news={news} 
          events={events} 
          jobs={jobs} 
          startups={startups}
        />
      </main>
      <Footer />
    </>
  );
}
