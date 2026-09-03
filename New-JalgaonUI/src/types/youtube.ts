export interface YouTubeVideo {
  id?: string;
  video_id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  published_at?: string;
  youtube_url?: string;
  embed_url?: string;
  duration_seconds?: number;
  is_short?: boolean;
  view_count?: string;
  like_count?: string;
  channel_title?: string;
}

export interface YouTubeVideoListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: YouTubeVideo[];
}

export interface YouTubeChannelInfo {
  channel_id?: string;
  title?: string;
  description?: string;
  custom_url?: string;
  thumbnail_url?: string;
  subscriber_count?: string;
  video_count?: string;
  view_count?: string;
  youtube_url?: string;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatViews(viewsStr?: string): string {
  if (!viewsStr) return '1.2K';
  const num = parseInt(viewsStr, 10);
  if (isNaN(num)) return viewsStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatNumber(numStr?: string): string {
  if (!numStr) return '0';
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return `${num}`;
}

export function formatSubscribers(subsStr?: string): string {
  if (!subsStr) return '24.5K subscribers';
  const num = parseInt(subsStr, 10);
  if (isNaN(num)) return `${subsStr} subscribers`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M subscribers`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K subscribers`;
  return `${num} subscribers`;
}

export function extractYouTubeId(url?: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}

export function getHighResThumbnail(video?: YouTubeVideo | null): string {
  if (!video) return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200';

  const videoId = video.video_id || extractYouTubeId(video.youtube_url || video.embed_url);
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  }

  if (video.thumbnail_url) {
    if (video.thumbnail_url.includes('ytimg.com/vi/')) {
      return video.thumbnail_url
        .replace('/hqdefault.jpg', '/maxresdefault.jpg')
        .replace('/mqdefault.jpg', '/maxresdefault.jpg')
        .replace('/sddefault.jpg', '/maxresdefault.jpg')
        .replace('/default.jpg', '/maxresdefault.jpg');
    }
    return video.thumbnail_url;
  }

  return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200';
}

export function handleThumbnailError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src.includes('/maxresdefault.jpg')) {
    target.src = target.src.replace('/maxresdefault.jpg', '/sddefault.jpg');
  } else if (target.src.includes('/sddefault.jpg')) {
    target.src = target.src.replace('/sddefault.jpg', '/hqdefault.jpg');
  }
}

export const DEFAULT_FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    video_id: '5X7bU5rRkWE',
    title: 'Jalgaon City Heritage & History — Special Documentary Podcast',
    description: 'Explore the rich culture, banana capital history, and heritage of Jalgaon district in this special podcast episode.',
    thumbnail_url: 'https://i.ytimg.com/vi/5X7bU5rRkWE/maxresdefault.jpg',
    published_at: '2025-10-15T12:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=5X7bU5rRkWE',
    embed_url: 'https://www.youtube.com/embed/5X7bU5rRkWE',
    duration_seconds: 1420,
    is_short: false,
    view_count: '15.4K',
    like_count: '1.2K',
  },
  {
    video_id: 'kJQP7kiw5Fk',
    title: 'Top Startups & Entrepreneurs of Jalgaon | Inspiring Stories',
    description: 'An insightful discussion with young entrepreneurs building successful businesses and innovations right from Jalgaon.',
    thumbnail_url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    published_at: '2025-11-01T10:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    embed_url: 'https://www.youtube.com/embed/kJQP7kiw5Fk',
    duration_seconds: 1850,
    is_short: false,
    view_count: '22.8K',
    like_count: '1.9K',
  },
  {
    video_id: 'fJ9rUzIMcZQ',
    title: 'Ajanta Caves & Jalgaon Tourism Guide — Travel Podcast',
    description: 'Everything you need to know about visiting Ajanta Caves, Patnadevi, and scenic tourist spots around Jalgaon.',
    thumbnail_url: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
    published_at: '2025-12-10T14:30:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    embed_url: 'https://www.youtube.com/embed/fJ9rUzIMcZQ',
    duration_seconds: 980,
    is_short: false,
    view_count: '18.9K',
    like_count: '1.6K',
  },
  {
    video_id: 'L_LUpnjgPso',
    title: 'Jalgaon Street Food Tour — Best Eats & Local Flavors #shorts',
    description: 'Quick tour of famous Shev Bhaji, Bharit, and local delicacies of Jalgaon! #shorts #jalgaon',
    thumbnail_url: 'https://i.ytimg.com/vi/L_LUpnjgPso/maxresdefault.jpg',
    published_at: '2026-01-05T08:00:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    embed_url: 'https://www.youtube.com/embed/L_LUpnjgPso',
    duration_seconds: 58,
    is_short: true,
    view_count: '45.2K',
    like_count: '3.8K',
  },
  {
    video_id: '3JZ_D3ELwOQ',
    title: 'Education & Colleges in Jalgaon — Campus Life & Opportunities',
    description: 'Detailed breakdown of universities, engineering colleges, and educational institutes in Jalgaon.',
    thumbnail_url: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg',
    published_at: '2026-01-20T11:15:00Z',
    youtube_url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    embed_url: 'https://www.youtube.com/embed/3JZ_D3ELwOQ',
    duration_seconds: 1240,
    is_short: false,
    view_count: '11.3K',
    like_count: '890',
  },
];
