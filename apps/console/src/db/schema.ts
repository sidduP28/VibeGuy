import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const sites = sqliteTable('sites', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().default('owner_default'),
  name: text('name').notNull().default('My Store'),
  domain: text('domain').notNull().default('http://localhost:3002'), // origin URL e.g. http://localhost:3002
  siteKey: text('site_key').notNull().unique(), // public key used by SDK
  defaultThemeId: text('default_theme_id'), // nullable FK to themes
  status: text('status').notNull().default('active'), // 'active' | 'archived'
  domains: text('domains').notNull().default('[]'), // JSON string array (backward compat)
  publicKey: text('public_key').notNull(), // backward compat alias for siteKey
  killSwitch: integer('kill_switch', { mode: 'boolean' }).notNull().default(false),
  selectorMap: text('selector_map'), // JSON string record
  createdAt: text('created_at').notNull(),
});

export const siteDna = sqliteTable('site_dna', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull().unique(),
  brandName: text('brand_name').notNull().default(''),
  palette: text('palette').notNull().default('[]'), // JSON array of hex strings
  fonts: text('fonts').notNull().default('[]'), // JSON array of font names
  tone: text('tone').notNull().default(''),
  audience: text('audience').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const themes = sqliteTable('themes', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull(), // FK to sites
  name: text('name').notNull(),
  tokens: text('tokens').notNull(), // JSON string of ThemeTokens (bg, fg, accent, fontHeading, fontBody, radius, space, etc.)
  isBuiltin: integer('is_builtin', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(''),
});

export const creators = sqliteTable('creators', {
  id: text('id').primaryKey(),
  siteId: text('site_id').notNull(), // FK to sites
  slug: text('slug').notNull(), // unique per site
  displayName: text('display_name').notNull(),
  themeId: text('theme_id'), // nullable FK to themes
  copyOverrides: text('copy_overrides').notNull().default('{}'), // JSON string of copy overrides
  status: text('status').notNull().default('active'), // 'active' | 'paused'
  // Compatibility fields
  name: text('name').notNull().default(''),
  handle: text('handle').notNull().default(''),
  niche: text('niche').notNull().default(''),
  audience: text('audience').notNull().default(''),
  interests: text('interests').notNull().default('[]'), // JSON string array
  tone: text('tone').notNull().default(''),
  aesthetic: text('aesthetic').notNull().default(''),
  vibeCode: text('vibe_code').notNull().default(''),
  utmSource: text('utm_source').notNull().default(''),
  utmCampaign: text('utm_campaign').notNull().default(''),
  referrerRules: text('referrer_rules').notNull().default('[]'), // JSON string array
  preferredCta: text('preferred_cta').notNull().default(''),
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
