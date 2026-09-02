import type { Metadata } from 'next';
import GlimpseDetailClient from './GlimpseDetailClient';
import { YouTubeVideo } from '@/types/youtube';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getVideo(id: string): Promise<YouTubeVideo | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/v1/jalgaon-glimpse/videos/${id}/`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`Failed to pre-fetch video detail for ${id}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return {
      title: 'Video Not Found | Jalgaon.com',
      description: 'The requested video could not be found.',
    };
  }

  return {
    title: `${video.title} | Jalgaon Glimpse`,
    description: video.description || `Watch ${video.title} on Jalgaon.com`,
    openGraph: {
      title: video.title,
      description: video.description,
      type: 'video.other',
      url: `/jalgaon-glimpse/${id}`,
      images: [
        {
          url: video.thumbnail_url,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description,
      images: [video.thumbnail_url],
    },
    alternates: {
      canonical: `/jalgaon-glimpse/${id}`,
    },
  };
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const video = await getVideo(id);

  const jsonLd = video
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.title,
        description: video.description || video.title,
        thumbnailUrl: [video.thumbnail_url],
        uploadDate: video.published_at,
        embedUrl: video.embed_url,
        contentUrl: video.youtube_url,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <GlimpseDetailClient videoId={id} initialVideo={video} />
    </>
  );
}
