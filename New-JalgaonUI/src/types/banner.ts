export type BannerType =
  | 'promotional'
  | 'business'
  | 'category'
  | 'service'
  | 'event'
  | 'sponsored'
  | 'seasonal'
  | 'offer';

export type BannerPlacement =
  | 'home'
  | 'category'
  | 'business'
  | 'industry'
  | 'sidebar'
  | 'compact';

export interface BannerItem {
  id: string | number;
  clientName?: string;
  websiteUrl?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  bannerImage?: string;
  mobileImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  badgeText?: string;
  bannerType?: BannerType;
  placement?: string;
  categorySlug?: string;
  businessSlug?: string;
  startDate?: string;
  endDate?: string;
  expiryDate?: string;
  isEnabled?: boolean;
  isActive?: boolean;
  status?: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE' | string;
  clicks?: number;
  impressions?: number;
  createdByName?: string;
  targetPage?: string;
  shopListingId?: number | string;
  isGraphic?: boolean;
}

export interface AdminBanner {
  id: number;
  client_name: string;
  website_url: string;
  banner_image: string;
  title?: string;
  subtitle?: string;
  badge_text?: string;
  cta_text?: string;
  start_date: string;
  expiry_date: string;
  is_enabled: boolean;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE' | string;
  clicks: number;
  impressions: number;
  ctr: number;
  created_by?: number | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}


export interface BannerFeatureBlock {
  id?: string;
  iconName?: string;
  title: string;
  description: string;
}

export interface BannerCarouselProps {
  banners?: BannerItem[];
  featureBlocks?: BannerFeatureBlock[];
  slot?: string;
  placement?: BannerPlacement;
  categorySlug?: string | null;
  businessSlug?: string | null;
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  variant?: 'hero' | 'inline' | 'compact' | 'card';
  className?: string;
}

