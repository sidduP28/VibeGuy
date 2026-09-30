export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  niche: string;
  audience: string;
  interests: string[];
  tone: string;
  aesthetic: string;
  themeId: string;
  vibeCode: string;
  utmRules: {
    source: string;
    campaign: string;
  };
  referrerRules: string[];
  preferredCta: string;
}

export type SlotName =
  | 'hero-image'
  | 'headline'
  | 'subheadline'
  | 'cta'
  | 'testimonial'
  | 'bundle'
  | 'offer'
  | 'banner';

export interface CampaignSlotContent {
  heroImage?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialImage?: string;
  bundleTitle?: string;
  bundlePrice?: string;
  bundleDescription?: string;
  offerText?: string;
  promoCode?: string;
  bannerText?: string;
}

export interface Campaign {
  id: string;
  siteId: string;
  creatorId: string;
  name: string;
  productUrl: string;
  productTitle: string;
  productDescription: string;
  productImage: string;
  productPrice: string;
  promoCode: string;
  offer: string;
  cta: string;
  hero: string;
  headline: string;
  subheadline: string;
  testimonialIds: string[];
  themeId: string;
  holdoutPct: number;
  status: 'active' | 'paused' | 'expired';
  expiresAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  id: string;
  domains: string[];
  publicKey: string;
  killSwitch: boolean;
  selectorMap?: Record<string, string>; // CSS selector -> slot name
}

export interface TriggerResult {
  type: 'vibe_code' | 'utm' | 'referrer' | 'none';
  value?: string;
  rawParams?: Record<string, string>;
}

export interface ThemeTokens {
  id: string;
  name: string;
  fontHeading: string;
  fontBody: string;
  primaryColor: string;
  primaryColorHover: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  textMutedColor: string;
  accentColor: string;
  borderRadius: string;
  imageTreatment?: 'rounded' | 'sharp' | 'pill';
}

export interface IngestEvent {
  visitorId: string;
  siteId: string;
  campaignId: string;
  creatorId?: string;
  variant: 'personalized' | 'control' | 'fallback';
  type: 'view' | 'slot_applied' | 'add_to_cart' | 'checkout' | 'purchase';
  orderId?: string;
  value?: number;
  metrics?: {
    execMs?: number;
    hideMs?: number;
    cls?: number;
    lcp?: number;
  };
  reason?: string;
  timestamp?: number;
}
