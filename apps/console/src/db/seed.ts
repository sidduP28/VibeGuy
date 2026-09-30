import { getDb } from './index';
import { sites, siteDna, creators, testimonials, themes, campaigns, campaignVersions } from './schema';
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
    owner_id TEXT NOT NULL DEFAULT 'owner_default',
    name TEXT NOT NULL DEFAULT 'My Store',
    domain TEXT NOT NULL DEFAULT 'http://localhost:3002',
    site_key TEXT NOT NULL UNIQUE,
    default_theme_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    domains TEXT NOT NULL DEFAULT '[]',
    public_key TEXT NOT NULL,
    kill_switch INTEGER NOT NULL DEFAULT 0,
    selector_map TEXT,
    created_at TEXT NOT NULL
  );`);

  // Safe migration for existing sites table
  try { await rawClient.execute(`ALTER TABLE sites ADD COLUMN owner_id TEXT NOT NULL DEFAULT 'owner_default';`); } catch {}
  try { await rawClient.execute(`ALTER TABLE sites ADD COLUMN name TEXT NOT NULL DEFAULT 'My Store';`); } catch {}
  try { await rawClient.execute(`ALTER TABLE sites ADD COLUMN domain TEXT NOT NULL DEFAULT 'http://localhost:3002';`); } catch {}
  try { await rawClient.execute(`ALTER TABLE sites ADD COLUMN site_key TEXT;`); } catch {}
  try { await rawClient.execute(`ALTER TABLE sites ADD COLUMN default_theme_id TEXT;`); } catch {}
  try { await rawClient.execute(`ALTER TABLE sites ADD COLUMN status TEXT NOT NULL DEFAULT 'active';`); } catch {}
  try { await rawClient.execute(`UPDATE sites SET site_key = COALESCE(site_key, public_key, id) WHERE site_key IS NULL OR site_key = '';`); } catch {}

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS site_dna (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL UNIQUE,
    brand_name TEXT NOT NULL DEFAULT '',
    palette TEXT NOT NULL DEFAULT '[]',
    fonts TEXT NOT NULL DEFAULT '[]',
    tone TEXT NOT NULL DEFAULT '',
    audience TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`);

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL DEFAULT 'site_aurora',
    name TEXT NOT NULL,
    tokens TEXT NOT NULL,
    is_builtin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ''
  );`);

  try { await rawClient.execute(`ALTER TABLE themes ADD COLUMN site_id TEXT NOT NULL DEFAULT 'site_aurora';`); } catch {}
  try { await rawClient.execute(`ALTER TABLE themes ADD COLUMN created_at TEXT NOT NULL DEFAULT '';`); } catch {}

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    slug TEXT NOT NULL DEFAULT '',
    display_name TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    handle TEXT NOT NULL DEFAULT '',
    niche TEXT NOT NULL DEFAULT '',
    audience TEXT NOT NULL DEFAULT '',
    interests TEXT NOT NULL DEFAULT '[]',
    tone TEXT NOT NULL DEFAULT '',
    aesthetic TEXT NOT NULL DEFAULT '',
    theme_id TEXT,
    copy_overrides TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    vibe_code TEXT NOT NULL DEFAULT '',
    utm_source TEXT NOT NULL DEFAULT '',
    utm_campaign TEXT NOT NULL DEFAULT '',
    referrer_rules TEXT NOT NULL DEFAULT '[]',
    preferred_cta TEXT NOT NULL DEFAULT '',
    brand_voice TEXT NOT NULL DEFAULT '',
    hero_banner TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );`);

  try { await rawClient.execute(`ALTER TABLE creators ADD COLUMN slug TEXT NOT NULL DEFAULT '';`); } catch {}
  try { await rawClient.execute(`ALTER TABLE creators ADD COLUMN display_name TEXT NOT NULL DEFAULT '';`); } catch {}
  try { await rawClient.execute(`ALTER TABLE creators ADD COLUMN copy_overrides TEXT NOT NULL DEFAULT '{}';`); } catch {}
  try { await rawClient.execute(`ALTER TABLE creators ADD COLUMN status TEXT NOT NULL DEFAULT 'active';`); } catch {}

  await rawClient.execute(`CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    image TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
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

  // Performance Optimization: WAL mode & High-speed query indexes
  try { await rawClient.execute(`PRAGMA journal_mode = WAL;`); } catch {}
  try { await rawClient.execute(`PRAGMA synchronous = NORMAL;`); } catch {}
  try { await rawClient.execute(`PRAGMA busy_timeout = 5000;`); } catch {}
  try { await rawClient.execute(`CREATE INDEX IF NOT EXISTS idx_events_site_id ON events (site_id);`); } catch {}
  try { await rawClient.execute(`CREATE INDEX IF NOT EXISTS idx_events_site_campaign ON events (site_id, campaign_id);`); } catch {}
  try { await rawClient.execute(`CREATE INDEX IF NOT EXISTS idx_events_visitor ON events (visitor_id);`); } catch {}
  try { await rawClient.execute(`CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);`); } catch {}
  try { await rawClient.execute(`CREATE INDEX IF NOT EXISTS idx_campaigns_site_id ON campaigns (site_id);`); } catch {}
  try { await rawClient.execute(`CREATE INDEX IF NOT EXISTS idx_creators_site_id ON creators (site_id);`); } catch {}

  const db = getDb();
  const now = new Date().toISOString();

  // 1. Seed Aurora as Site #1
  const auroraSite = {
    id: 'site_aurora',
    ownerId: 'owner_default',
    name: 'Aurora Atelier',
    domain: 'http://localhost:3002',
    siteKey: 'pk_live_aurora_2026',
    defaultThemeId: 'theme_aurora_default',
    status: 'active',
    domains: JSON.stringify(['localhost:3002', '127.0.0.1:3002', 'aurora-store.com']),
    publicKey: 'pk_live_aurora_2026',
    killSwitch: false,
    selectorMap: JSON.stringify({
      '[data-vibe-slot="headline"]': 'headline',
      '[data-vibe-slot="subheadline"]': 'subheadline',
      '[data-vibe-slot="cta"]': 'cta',
      '[data-vibe-slot="offer"]': 'offer',
      '[data-vibe-slot="hero-image"]': 'hero-image',
    }),
    createdAt: now,
  };

  await db.insert(sites).values(auroraSite).onConflictDoNothing();

  // Also seed legacy site_demo if needed
  await db
    .insert(sites)
    .values({
      ...auroraSite,
      id: 'site_demo',
      name: 'Aurora Demo Store',
      siteKey: 'pk_live_vibepersonalize_2026',
      publicKey: 'pk_live_vibepersonalize_2026',
    })
    .onConflictDoNothing();

  // 2. Seed Aurora Site DNA
  const auroraDna = {
    id: 'dna_aurora',
    siteId: 'site_aurora',
    brandName: 'Aurora Atelier',
    palette: JSON.stringify(['#0f172a', '#22c55e', '#fafafa', '#f59e0b', '#38bdf8']),
    fonts: JSON.stringify(['Fraunces', 'Source Sans 3', 'IBM Plex Mono']),
    tone: 'Calm, architectural, intentional restraint',
    audience: 'Design connoisseurs, architects, quiet luxury patrons',
    notes: 'Curated boutique objects with zero clutter and high craft.',
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(siteDna).values(auroraDna).onConflictDoNothing();
  await db.insert(siteDna).values({ ...auroraDna, id: 'dna_demo', siteId: 'site_demo' }).onConflictDoNothing();

  // 3. Seed Themes for Aurora
  const auroraThemes = [
    {
      id: 'theme_aurora_default',
      siteId: 'site_aurora',
      name: 'Aurora Atelier Default',
      tokens: JSON.stringify({
        bg: '#ffffff',
        fg: '#0f172a',
        accent: '#2563eb',
        cardBg: '#f8fafc',
        border: '#e2e8f0',
        muted: '#64748b',
        fontHeading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontBody: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        radius: '8px',
        space: '16px',
        copyDefaults: {
          headline: 'Deliberate Objects for Intentional Living',
          subheadline: 'A curated collection of minimalist home and studio artifacts.',
          ctaText: 'Explore Collection',
        },
      }),
      isBuiltin: true,
      createdAt: now,
    },
    {
      id: 'theme_energy',
      siteId: 'site_aurora',
      name: 'High-Impact Fitness',
      tokens: JSON.stringify({
        bg: '#0f172a',
        fg: '#f8fafc',
        accent: '#22c55e',
        cardBg: '#1e293b',
        border: '#334155',
        muted: '#94a3b8',
        fontHeading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontBody: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        radius: '4px',
        space: '16px',
        copyDefaults: {
          headline: 'High-Impact Performance Gear Curated by Fiona',
          subheadline: 'Engineered training essentials tested across 500+ intense conditioning and barbell sessions.',
          ctaText: 'Shop Fiona’s Training Kit',
        },
      }),
      isBuiltin: false,
      createdAt: now,
    },
    {
      id: 'theme_calm',
      siteId: 'site_aurora',
      name: 'Calm Architectural',
      tokens: JSON.stringify({
        bg: '#fafafa',
        fg: '#18181b',
        accent: '#52525b',
        cardBg: '#ffffff',
        border: '#e4e4e7',
        muted: '#71717a',
        fontHeading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontBody: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        radius: '0px',
        space: '16px',
        copyDefaults: {
          headline: 'Essential Living Space Edit by Max',
          subheadline: 'Calm tactile objects crafted from linen, stone, and unlacquered raw materials.',
          ctaText: 'Explore Calm Spaces',
        },
      }),
      isBuiltin: false,
      createdAt: now,
    },
    {
      id: 'theme_gold',
      siteId: 'site_aurora',
      name: 'Quiet Luxury Gold',
      tokens: JSON.stringify({
        bg: '#090d16',
        fg: '#f8fafc',
        accent: '#f59e0b',
        cardBg: '#121826',
        border: '#1e293b',
        muted: '#94a3b8',
        fontHeading: 'Georgia, Cambria, "Times New Roman", Times, serif',
        fontBody: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        radius: '2px',
        space: '16px',
        copyDefaults: {
          headline: 'The Haute Beauty Sanctuary Curated by Lena',
          subheadline: 'Potent peptide formulations and pure mulberry silk rituals designed for radiant rest.',
          ctaText: 'Acquire Lena’s Private Reserve',
        },
      }),
      isBuiltin: false,
      createdAt: now,
    },
    {
      id: 'theme_cyber',
      siteId: 'site_aurora',
      name: 'Dark Cyber Hardware',
      tokens: JSON.stringify({
        bg: '#0b0f19',
        fg: '#f1f5f9',
        accent: '#38bdf8',
        cardBg: '#131b2e',
        border: '#1e293b',
        muted: '#94a3b8',
        fontHeading: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontBody: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        radius: '6px',
        space: '16px',
        copyDefaults: {
          headline: 'High-Density Desk & Travel Gear by Tom',
          subheadline: 'Precision-machined power, smart thermal monitoring, and low-latency acoustic fidelity.',
          ctaText: 'Upgrade Your Hardware Stack',
        },
      }),
      isBuiltin: false,
      createdAt: now,
    },
  ];

  for (const t of auroraThemes) {
    await db.insert(themes).values(t).onConflictDoNothing();
    await db.insert(themes).values({ ...t, id: `${t.id}_demo`, siteId: 'site_demo' }).onConflictDoNothing();
  }

  // Seed builtin global themes into themes table for site_aurora as starter library
  for (const [id, themeTokens] of Object.entries(BUILTIN_THEMES)) {
    await db
      .insert(themes)
      .values({
        id: `builtin_${id}`,
        siteId: 'site_aurora',
        name: themeTokens.name,
        tokens: JSON.stringify({
          bg: themeTokens.backgroundColor,
          fg: themeTokens.textColor,
          accent: themeTokens.accentColor || themeTokens.primaryColor,
          cardBg: themeTokens.cardBackgroundColor,
          fontHeading: themeTokens.fontHeading,
          fontBody: themeTokens.fontBody,
          radius: themeTokens.borderRadius,
          space: '16px',
        }),
        isBuiltin: true,
        createdAt: now,
      })
      .onConflictDoNothing();
  }

  // 4. Seed Creators migrated from data/creators.ts
  const auroraCreators = [
    {
      id: 'cr_fitfiona',
      siteId: 'site_aurora',
      slug: 'fitfiona',
      displayName: 'Fiona Vance',
      name: 'Fiona Vance',
      handle: '@fitfiona',
      niche: 'High-Impact Fitness',
      audience: 'Athletes & Conditioning',
      interests: JSON.stringify(['CrossFit', 'Strength', 'Recovery']),
      tone: 'Relentless, empowering, clear',
      aesthetic: 'High-contrast neon lime on pitch black',
      themeId: 'theme_energy',
      status: 'active',
      vibeCode: 'fitfiona',
      utmSource: 'instagram',
      utmCampaign: 'fiona_spring',
      referrerRules: JSON.stringify(['instagram.com', 'linkin.bio']),
      preferredCta: 'Shop Fiona’s Training Kit',
      brandVoice: 'Relentless energy. Zero excuses.',
      heroBanner: '/images/hero-fitfiona.jpg',
      copyOverrides: JSON.stringify({
        headline: 'High-Impact Performance Gear Curated by Fiona',
        subheadline: 'Engineered training essentials tested across 500+ intense conditioning and barbell sessions.',
        ctaText: 'Shop Fiona’s Training Kit',
        heroImage: '/images/hero-fitfiona.jpg',
        offer: 'Save 20% on Fiona’s Athletic Picks with code FIT20',
        bundleText: 'Complete Conditioning Bundle · Save 20%',
        discountCode: 'FIT20',
        discountPercent: 20,
        testimonials: [
          {
            quote: 'These bands and the shaker survived daily abuse in my gym bag. Absolutely unbeatable durability.',
            author: 'Fiona Vance',
            role: 'Pro Trainer & Hybrid Athlete',
          },
          {
            quote: 'Finally a kit with no filler. The grip on the mat alone changed my floor mobility sessions.',
            author: 'Marcus Cole',
            role: 'Strength Coach',
          },
        ],
      }),
      createdAt: now,
    },
    {
      id: 'cr_minimal_max',
      siteId: 'site_aurora',
      slug: 'minimal-max',
      displayName: 'Max Sterling',
      name: 'Max Sterling',
      handle: '@minimalmax',
      niche: 'Minimalist Architecture & Home',
      audience: 'Architects, industrial designers, intentional curators',
      interests: JSON.stringify(['Brutalism', 'Ceramics', 'Workspace Ergonomics']),
      tone: 'Calm, intentional, precise',
      aesthetic: 'Strict monochrome, brutalist grid',
      themeId: 'theme_calm',
      status: 'active',
      vibeCode: 'minimal-max',
      utmSource: 'twitter',
      utmCampaign: 'max_calm',
      referrerRules: JSON.stringify(['x.com', 'twitter.com']),
      preferredCta: 'Explore Calm Spaces',
      brandVoice: 'Calm precision. Zero noise. Only what matters.',
      heroBanner: '/images/hero-minimal-max.jpg',
      copyOverrides: JSON.stringify({
        headline: 'Essential Living Space Edit by Max',
        subheadline: 'Calm tactile objects crafted from linen, stone, and unlacquered raw materials.',
        ctaText: 'Explore Calm Spaces',
        heroImage: '/images/hero-minimal-max.jpg',
        offer: 'Enjoy 15% off deliberate essentials with code CALM15',
        bundleText: 'Quiet Morning Essentials Set · 15% Off',
        discountCode: 'CALM15',
        discountPercent: 15,
        testimonials: [
          {
            quote: 'Zero visual noise. Every piece here earned its right to exist in a deliberate home.',
            author: 'Max Sterling',
            role: 'Architectural Minimalist',
          },
          {
            quote: 'The ceramic mug and linen throw transformed my morning routine into a quiet ritual.',
            author: 'Elena Lin',
            role: 'Industrial Designer',
          },
        ],
      }),
      createdAt: now,
    },
    {
      id: 'cr_luxe_lena',
      siteId: 'site_aurora',
      slug: 'luxe-lena',
      displayName: 'Lena Rostova',
      name: 'Lena Rostova',
      handle: '@luxelena',
      niche: 'Haute Beauty & Formulations',
      audience: 'Luxury collectors, beauty formulators',
      interests: JSON.stringify(['Private Aviation', 'Silk Rituals', 'Peptides']),
      tone: 'Sophisticated, hushed, timeless',
      aesthetic: 'Warm antique bronze, charcoal, serifs',
      themeId: 'theme_gold',
      status: 'active',
      vibeCode: 'luxe-lena',
      utmSource: 'youtube',
      utmCampaign: 'lena_luxury',
      referrerRules: JSON.stringify(['youtube.com', 'vogue.com']),
      preferredCta: 'Acquire Lena’s Private Reserve',
      brandVoice: 'Whispered authority. Timeless restraint. Absolute craft.',
      heroBanner: '/images/hero-luxe-lena.jpg',
      copyOverrides: JSON.stringify({
        headline: 'The Haute Beauty Sanctuary Curated by Lena',
        subheadline: 'Potent peptide formulations and pure mulberry silk rituals designed for radiant rest.',
        ctaText: 'Acquire Lena’s Private Reserve',
        heroImage: '/images/hero-luxe-lena.jpg',
        offer: 'Receive 25% privilege savings with code LUXE25',
        bundleText: 'L’Édition Nocturne Luxury Suite · 25% Off',
        discountCode: 'LUXE25',
        discountPercent: 25,
        testimonials: [
          {
            quote: 'Uncompromising formulation. The peptide serum delivers visible dermal clarity within days.',
            author: 'Lena Rostova',
            role: 'Beauty Director & Formulator',
          },
          {
            quote: 'The 24k gold sonic roller is an indispensable staple in my backstage kit.',
            author: 'Claire Delacroix',
            role: 'Editorial Makeup Artist',
          },
        ],
      }),
      createdAt: now,
    },
    {
      id: 'cr_techtom',
      siteId: 'site_aurora',
      slug: 'techtom',
      displayName: 'Tom Zhao',
      name: 'Tom Zhao',
      handle: '@techtom',
      niche: 'High-Density Gadgets & Audio',
      audience: 'Hardware engineers, nomads, power users',
      interests: JSON.stringify(['GaN Chargers', 'CNC Metal', 'Acoustics']),
      tone: 'Analytical, fast, engineering-first',
      aesthetic: 'Cyber navy, cyan accents, monospace',
      themeId: 'theme_cyber',
      status: 'active',
      vibeCode: 'techtom',
      utmSource: 'tiktok',
      utmCampaign: 'tom_hardware',
      referrerRules: JSON.stringify(['tiktok.com', 'news.ycombinator.com']),
      preferredCta: 'Upgrade Your Hardware Stack',
      brandVoice: 'Precision over hype. Measurable specs.',
      heroBanner: '/images/hero-techtom.jpg',
      copyOverrides: JSON.stringify({
        headline: 'High-Density Desk & Travel Gear by Tom',
        subheadline: 'Precision-machined power, smart thermal monitoring, and low-latency acoustic fidelity.',
        ctaText: 'Upgrade Your Hardware Stack',
        heroImage: '/images/hero-techtom.jpg',
        offer: 'Deploy 10% code TECH10 on high-efficiency gadgets',
        bundleText: 'Nomad Workstation Power Stack · 10% Off',
        discountCode: 'TECH10',
        discountPercent: 10,
        testimonials: [
          {
            quote: '100W in a chassis this thin is unprecedented. Powers my entire remote rig seamlessly.',
            author: 'Tom Zhao',
            role: 'Hardware Engineer & Creator',
          },
          {
            quote: 'The wireless earbuds have lowest latency I have measured on a portable setup.',
            author: 'Devon Vance',
            role: 'Systems Architect',
          },
        ],
      }),
      createdAt: now,
    },
  ];

  for (const c of auroraCreators) {
    await db.insert(creators).values(c).onConflictDoNothing();
    await db.insert(creators).values({ ...c, id: `${c.id}_demo`, siteId: 'site_demo' }).onConflictDoNothing();
  }

  // 5. Seed Campaigns for Aurora
  const auroraCampaigns = [
    {
      id: 'cmp_fitfiona',
      siteId: 'site_aurora',
      creatorId: 'cr_fitfiona',
      name: 'Fiona Vance Conditioning Kit',
      productUrl: 'http://localhost:3002/shop',
      productTitle: 'Complete Conditioning Bundle',
      productDescription: 'Heavy-gauge resistance system and shaker.',
      productImage: '/images/hero-fitfiona.jpg',
      productPrice: '$64.00',
      promoCode: 'FIT20',
      offer: 'Save 20% on Fiona’s Athletic Picks with code FIT20',
      cta: 'Shop Fiona’s Training Kit',
      hero: '/images/hero-fitfiona.jpg',
      headline: 'High-Impact Performance Gear Curated by Fiona',
      subheadline: 'Engineered training essentials tested across 500+ intense conditioning and barbell sessions.',
      testimonialIds: '[]',
      themeId: 'theme_energy',
      holdoutPct: 10,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cmp_minimal_max',
      siteId: 'site_aurora',
      creatorId: 'cr_minimal_max',
      name: 'Max Sterling Calm Living Edit',
      productUrl: 'http://localhost:3002/shop',
      productTitle: 'Quiet Morning Essentials Set',
      productDescription: 'Ceramic mug and pure linen throw.',
      productImage: '/images/hero-minimal-max.jpg',
      productPrice: '$85.00',
      promoCode: 'CALM15',
      offer: 'Enjoy 15% off deliberate essentials with code CALM15',
      cta: 'Explore Calm Spaces',
      hero: '/images/hero-minimal-max.jpg',
      headline: 'Essential Living Space Edit by Max',
      subheadline: 'Calm tactile objects crafted from linen, stone, and unlacquered raw materials.',
      testimonialIds: '[]',
      themeId: 'theme_calm',
      holdoutPct: 10,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cmp_luxe_lena',
      siteId: 'site_aurora',
      creatorId: 'cr_luxe_lena',
      name: 'Lena Rostova Haute Beauty Suite',
      productUrl: 'http://localhost:3002/shop',
      productTitle: 'L’Édition Nocturne Luxury Suite',
      productDescription: 'Peptide dermal elixir and 24k sonic roller.',
      productImage: '/images/hero-luxe-lena.jpg',
      productPrice: '$180.00',
      promoCode: 'LUXE25',
      offer: 'Receive 25% privilege savings with code LUXE25',
      cta: 'Acquire Lena’s Private Reserve',
      hero: '/images/hero-luxe-lena.jpg',
      headline: 'The Haute Beauty Sanctuary Curated by Lena',
      subheadline: 'Potent peptide formulations and pure mulberry silk rituals designed for radiant rest.',
      testimonialIds: '[]',
      themeId: 'theme_gold',
      holdoutPct: 10,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cmp_techtom',
      siteId: 'site_aurora',
      creatorId: 'cr_techtom',
      name: 'Tom Zhao High-Density Desk Gear',
      productUrl: 'http://localhost:3002/shop',
      productTitle: 'Nomad Workstation Power Stack',
      productDescription: '100W GaN power matrix and low-latency acoustic buds.',
      productImage: '/images/hero-techtom.jpg',
      productPrice: '$120.00',
      promoCode: 'TECH10',
      offer: 'Deploy 10% code TECH10 on high-efficiency gadgets',
      cta: 'Upgrade Your Hardware Stack',
      hero: '/images/hero-techtom.jpg',
      headline: 'High-Density Desk & Travel Gear by Tom',
      subheadline: 'Precision-machined power, smart thermal monitoring, and low-latency acoustic fidelity.',
      testimonialIds: '[]',
      themeId: 'theme_cyber',
      holdoutPct: 10,
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const cmp of auroraCampaigns) {
    await db.insert(campaigns).values(cmp).onConflictDoNothing();
    await db.insert(campaigns).values({ ...cmp, id: `${cmp.id}_demo`, siteId: 'site_demo' }).onConflictDoNothing();
    await db
      .insert(campaignVersions)
      .values({ id: `${cmp.id}_v1`, campaignId: cmp.id, version: 1, snapshot: JSON.stringify(cmp), createdAt: now })
      .onConflictDoNothing();
  }
}

export { seedDatabase as seed };
