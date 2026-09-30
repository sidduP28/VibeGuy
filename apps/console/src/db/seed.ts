import { getDb } from './index';
import { sites, creators, testimonials, themes, campaigns, campaignVersions } from './schema';
import { BUILTIN_THEMES } from '@vibe/core';
import { createClient } from '@libsql/client';
import * as path from 'node:path';

let _seeded = false;

export async function seedDatabase() {
  if (_seeded) return;
  _seeded = true;

  const sqlitePath =
    process.cwd().endsWith('apps/console') || process.cwd().endsWith('apps\\console')
      ? path.resolve(process.cwd(), 'local.sqlite')
      : path.resolve(process.cwd(), 'apps/console/local.sqlite');
  const dbUrl = process.env.TURSO_DATABASE_URL || `file:${sqlitePath}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const rawClient = createClient({ url: dbUrl, authToken });

  // Create tables idempotently
  await rawClient.execute(`CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    domains TEXT NOT NULL,
    public_key TEXT NOT NULL UNIQUE,
    kill_switch INTEGER NOT NULL DEFAULT 0,
    selector_map TEXT,
    created_at TEXT NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    name TEXT NOT NULL,
    handle TEXT NOT NULL,
    niche TEXT NOT NULL,
    audience TEXT NOT NULL,
    interests TEXT NOT NULL,
    tone TEXT NOT NULL,
    aesthetic TEXT NOT NULL,
    theme_id TEXT NOT NULL,
    vibe_code TEXT NOT NULL UNIQUE,
    utm_source TEXT NOT NULL DEFAULT '',
    utm_campaign TEXT NOT NULL DEFAULT '',
    referrer_rules TEXT NOT NULL DEFAULT '[]',
    preferred_cta TEXT NOT NULL,
    brand_voice TEXT NOT NULL DEFAULT '',
    hero_banner TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    image TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tokens TEXT NOT NULL,
    is_builtin INTEGER NOT NULL DEFAULT 1
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_description TEXT NOT NULL DEFAULT '',
    product_image TEXT NOT NULL,
    product_price TEXT NOT NULL,
    promo_code TEXT NOT NULL DEFAULT '',
    offer TEXT NOT NULL DEFAULT '',
    cta TEXT NOT NULL,
    hero TEXT NOT NULL,
    headline TEXT NOT NULL,
    subheadline TEXT NOT NULL DEFAULT '',
    testimonial_ids TEXT NOT NULL DEFAULT '[]',
    theme_id TEXT NOT NULL,
    holdout_pct INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'active',
    expires_at TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS campaign_versions (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    snapshot TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS reference_sites (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    palette TEXT NOT NULL DEFAULT '[]',
    fonts TEXT NOT NULL DEFAULT '[]',
    cta_style TEXT NOT NULL DEFAULT '{}',
    copy_tone TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    site_id TEXT NOT NULL,
    campaign_id TEXT NOT NULL,
    creator_id TEXT,
    variant TEXT NOT NULL,
    type TEXT NOT NULL,
    order_id TEXT,
    value REAL,
    exec_ms INTEGER,
    hide_ms INTEGER,
    cls INTEGER,
    lcp INTEGER,
    reason TEXT,
    simulated INTEGER NOT NULL DEFAULT 0,
    timestamp INTEGER NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    current TEXT NOT NULL,
    suggested TEXT NOT NULL,
    reason TEXT NOT NULL,
    impact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  );`);

  const db = getDb();
  const now = new Date().toISOString();

  // Seed site
  await db
    .insert(sites)
    .values({
      id: 'site_demo',
      domains: JSON.stringify(['localhost:3000', 'store.example.com', '127.0.0.1']),
      publicKey: 'pk_live_vibepersonalize_2026',
      killSwitch: false,
      selectorMap: JSON.stringify({
        '.hero-title': 'headline',
        '.hero-sub': 'subheadline',
        '.hero-btn': 'cta',
      }),
      createdAt: now,
    })
    .onConflictDoNothing();

  // Seed builtin themes
  for (const [id, themeTokens] of Object.entries(BUILTIN_THEMES)) {
    await db
      .insert(themes)
      .values({ id, name: themeTokens.name, tokens: JSON.stringify(themeTokens), isBuiltin: true })
      .onConflictDoNothing();
  }

  // Seed creators
  const creatorsData = [
    {
      id: 'cr_fit',
      siteId: 'site_demo',
      name: 'Alex Rivera',
      handle: '@alexfit',
      niche: 'High-Performance Fitness',
      audience: 'Strength athletes & biohackers (ages 20-38)',
      interests: JSON.stringify(['CrossFit', 'Powerlifting', 'Keto', 'Supplements']),
      tone: 'Relentless, empowering, science-backed',
      aesthetic: 'High-contrast neon lime on pitch black',
      themeId: 'fitness-energy',
      vibeCode: 'fit2026',
      utmSource: 'instagram',
      utmCampaign: 'alexfit_spring',
      referrerRules: JSON.stringify(['instagram.com', 'youtube.com', 'linkin.bio']),
      preferredCta: 'Crush Your PR Today',
      brandVoice: 'Science-backed. Relentless drive. Zero fluff.',
      heroBanner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
      createdAt: now,
    },
    {
      id: 'cr_min',
      siteId: 'site_demo',
      name: 'Marcus Chen',
      handle: '@marcusminimal',
      niche: 'Productivity & Minimalist Design',
      audience: 'Engineers, architects, founders',
      interests: JSON.stringify(['Workspace Setup', 'Industrial Design', 'Mechanical Keyboards']),
      tone: 'Calm, intentional, precise',
      aesthetic: 'Strict monochrome, generous whitespace, brutalist grid',
      themeId: 'minimalist',
      vibeCode: 'minimal2026',
      utmSource: 'twitter',
      utmCampaign: 'marcus_desk',
      referrerRules: JSON.stringify(['x.com', 'twitter.com', 'substack.com']),
      preferredCta: 'Upgrade Your Workflow',
      brandVoice: 'Calm precision. Zero noise. Only what matters.',
      heroBanner: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
      createdAt: now,
    },
    {
      id: 'cr_lux',
      siteId: 'site_demo',
      name: 'Elena Rostova',
      handle: '@elenalux',
      niche: 'Quiet Luxury & High Fashion',
      audience: 'Ultra-high-net-worth curators',
      interests: JSON.stringify(['Haute Horlogerie', 'Private Aviation', 'Bespoke Tailoring']),
      tone: 'Sophisticated, hushed, timeless',
      aesthetic: 'Warm antique bronze, charcoal, serifs',
      themeId: 'luxury',
      vibeCode: 'lux2026',
      utmSource: 'youtube',
      utmCampaign: 'elena_collection',
      referrerRules: JSON.stringify(['youtube.com', 'vogue.com']),
      preferredCta: 'Acquire The Private Edition',
      brandVoice: 'Whispered authority. Timeless restraint. Absolute craft.',
      heroBanner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
      createdAt: now,
    },
  ];

  for (const c of creatorsData) {
    await db.insert(creators).values(c).onConflictDoNothing();
  }

  // Seed testimonials
  const testimonialsData = [
    {
      id: 'test_fit_1',
      creatorId: 'cr_fit',
      quote: 'This formula completely rewired my morning training blocks. Zero jitter crash, 100% clean output.',
      author: 'Alex Rivera (Verified Athlete)',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      approved: true,
      createdAt: now,
    },
    {
      id: 'test_min_1',
      creatorId: 'cr_min',
      quote: 'Zero friction, zero bloat. The only gear on my desk that earned permanent real estate.',
      author: 'Marcus Chen (Staff Architect)',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      approved: true,
      createdAt: now,
    },
    {
      id: 'test_lux_1',
      creatorId: 'cr_lux',
      quote: 'Impeccable craftsmanship. A rare harmony of artisanal discipline and understated grace.',
      author: 'Elena Rostova (Luxury Editor)',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      approved: true,
      createdAt: now,
    },
  ];

  for (const t of testimonialsData) {
    await db.insert(testimonials).values(t).onConflictDoNothing();
  }

  // Seed campaigns
  const campaignsData = [
    {
      id: 'cmp_fit',
      siteId: 'site_demo',
      creatorId: 'cr_fit',
      name: 'Alex Rivera Spring Muscle Surge',
      productUrl: 'https://store.example.com/products/hydro-fuel',
      productTitle: 'Apex HydroFuel Electrolyte & ATP Stack',
      productDescription: 'Raw cellular hydration matrix with 1000mg sodium, organic magnesium bisglycinate, and bio-fermented taurine.',
      productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      productPrice: '$48.00 (Save 20% with code ALEX20)',
      promoCode: 'ALEX20',
      offer: '20% OFF Creator Exclusive Bundle + Free Shaker',
      cta: 'Claim The Alex Rivera Stack',
      hero: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
      headline: 'Fuel Like Alex Rivera: Peak Athletic Performance',
      subheadline: "The exact hydration and mitochondrial stack powering Alex's 5:00 AM heavy barbell sessions.",
      testimonialIds: JSON.stringify(['test_fit_1']),
      themeId: 'fitness-energy',
      holdoutPct: 10,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cmp_min',
      siteId: 'site_demo',
      creatorId: 'cr_min',
      name: 'Marcus Chen Minimalist Workstation',
      productUrl: 'https://store.example.com/products/desk-mat',
      productTitle: 'Monolith Anodized Aluminum & Wool Desk Tray',
      productDescription: 'CNC-milled single-block aerospace grade 6061 aluminum paired with charcoal Merino felt.',
      productImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      productPrice: '$85.00',
      promoCode: 'MARCUS15',
      offer: '15% OFF for Marcus Chen Subscribers',
      cta: 'Explore The Minimal Desk',
      hero: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
      headline: 'Designed with Marcus Chen: Zero Distraction Workspaces',
      subheadline: 'Eliminate visual clutter. Engineered for developers and creators who demand absolute focus.',
      testimonialIds: JSON.stringify(['test_min_1']),
      themeId: 'minimalist',
      holdoutPct: 10,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cmp_lux',
      siteId: 'site_demo',
      creatorId: 'cr_lux',
      name: 'Elena Rostova Private Reserve',
      productUrl: 'https://store.example.com/products/heritage-serum',
      productTitle: 'Maison Royale 24K Botanical Elixir',
      productDescription: 'Cold-pressed Damask rose petals suspended in French squalane and colloidal bio-gold.',
      productImage: 'https://images.unsplash.com/photo-1608248597359-576485890e0c?w=800&q=80',
      productPrice: '$240.00',
      promoCode: 'ELENA',
      offer: 'Complimentary Bespoke Travel Atomizer',
      cta: "Acquire Elena's Private Reserve",
      hero: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
      headline: 'The Elena Rostova Edit: Uncompromising Craftsmanship',
      subheadline: 'Curated exclusively for patrons of quiet elegance. Limited batch formulation.',
      testimonialIds: JSON.stringify(['test_lux_1']),
      themeId: 'luxury',
      holdoutPct: 10,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const cmp of campaignsData) {
    await db.insert(campaigns).values(cmp).onConflictDoNothing();
    await db
      .insert(campaignVersions)
      .values({ id: `${cmp.id}_v1`, campaignId: cmp.id, version: 1, snapshot: JSON.stringify(cmp), createdAt: now })
      .onConflictDoNothing();
  }
}

export { seedDatabase as seed };
