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
