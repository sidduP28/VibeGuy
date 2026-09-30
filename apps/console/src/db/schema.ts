import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const sites = sqliteTable('sites', {
  id: text('id').primaryKey(),
  domains: text('domains').notNull(), // JSON string array
  publicKey: text('public_key').notNull().unique(),
  killSwitch: integer('kill_switch', { mode: 'boolean' }).notNull().default(false),
  selectorMap: text('selector_map'), // JSON string record
  createdAt: text('created_at').notNull(),
});

export const creators = sqliteTable('creators', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull(),
  name: text('name').notNull(),
  handle: text('handle').notNull(),
  niche: text('niche').notNull(),
  audience: text('audience').notNull(),
  interests: text('interests').notNull(), // JSON string array
  tone: text('tone').notNull(),
  aesthetic: text('aesthetic').notNull(),
  themeId: text('theme_id').notNull(),
  vibeCode: text('vibe_code').notNull().unique(),
  utmSource: text('utm_source').notNull().default(''),
  utmCampaign: text('utm_campaign').notNull().default(''),
  referrerRules: text('referrer_rules').notNull().default('[]'), // JSON string array
  preferredCta: text('preferred_cta').notNull(),
  brandVoice: text('brand_voice').notNull().default(''),
  heroBanner: text('hero_banner').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  creatorId: text('creator_id').notNull(),
  quote: text('quote').notNull(),
  author: text('author').notNull(),
  image: text('image').notNull(),
  approved: integer('approved', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const themes = sqliteTable('themes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tokens: text('tokens').notNull(), // JSON string of ThemeTokens
  isBuiltin: integer('is_builtin', { mode: 'boolean' }).notNull().default(true),
});

export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull(),
  creatorId: text('creator_id').notNull(),
  name: text('name').notNull(),
  productUrl: text('product_url').notNull(),
  productTitle: text('product_title').notNull(),
  productDescription: text('product_description').notNull().default(''),
  productImage: text('product_image').notNull(),
  productPrice: text('product_price').notNull(),
  promoCode: text('promo_code').notNull().default(''),
  offer: text('offer').notNull().default(''),
  cta: text('cta').notNull(),
  hero: text('hero').notNull(),
  headline: text('headline').notNull(),
  subheadline: text('subheadline').notNull().default(''),
  testimonialIds: text('testimonial_ids').notNull().default('[]'), // JSON string array
  themeId: text('theme_id').notNull(),
  holdoutPct: integer('holdout_pct').notNull().default(10),
  status: text('status').notNull().default('active'), // 'active' | 'paused' | 'expired'
  expiresAt: text('expires_at'),
  version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const campaignVersions = sqliteTable('campaign_versions', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull(),
  version: integer('version').notNull(),
  snapshot: text('snapshot').notNull(), // JSON string of campaign data
  createdAt: text('created_at').notNull(),
});

export const referenceSites = sqliteTable('reference_sites', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  palette: text('palette').notNull().default('[]'),     // JSON array
  fonts: text('fonts').notNull().default('[]'),         // JSON array
  ctaStyle: text('cta_style').notNull().default('{}'),  // JSON object
  copyTone: text('copy_tone').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  visitorId: text('visitor_id').notNull(),
  siteId: text('site_id').notNull(),
  campaignId: text('campaign_id').notNull(),
  creatorId: text('creator_id'),
  variant: text('variant').notNull(), // 'personalized' | 'control' | 'fallback'
  type: text('type').notNull(),        // 'view' | 'slot_applied' | 'add_to_cart' | 'checkout' | 'purchase'
  orderId: text('order_id'),
  value: real('value'),
  execMs: integer('exec_ms'),
  hideMs: integer('hide_ms'),
  cls: integer('cls'),   // stored as milliCLS (CLS * 1000)
  lcp: integer('lcp'),   // ms
  reason: text('reason'),
  simulated: integer('simulated', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp').notNull(),
});

export const recommendations = sqliteTable('recommendations', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull(),
  current: text('current').notNull(), // JSON string
  suggested: text('suggested').notNull(), // JSON string
  reason: text('reason').notNull(),
  impact: text('impact').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
});
