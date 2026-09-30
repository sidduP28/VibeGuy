import { themeToCssVars } from '@vibe/core';

export interface AuroraSiteConfig {
  site: {
    id: string;
    name: string;
    domain: string;
    siteKey: string;
    defaultThemeId: string;
    status: string;
  };
  allowedCreatorSlugs: string[];
  creators: Record<string, any>;
  themes: Record<string, any>;
  defaultTheme: any;
  holdout: number;
}

const FALLBACK_CONFIG: AuroraSiteConfig = {
  site: {
    id: 'site_aurora',
    name: 'Aurora Atelier',
    domain: 'http://localhost:3002',
    siteKey: 'pk_live_aurora_2026',
    defaultThemeId: 'theme_aurora_default',
    status: 'active',
  },
  allowedCreatorSlugs: ['fitfiona', 'minimal-max', 'luxe-lena', 'techtom'],
  creators: {
    fitfiona: {
      slug: 'fitfiona',
      name: 'Fiona Vance',
      handle: '@fitfiona',
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
      ],
      theme: {
        name: 'energy',
        bg: '#0f172a',
        fg: '#f8fafc',
        accent: '#22c55e',
        cardBg: '#1e293b',
        border: '#334155',
        muted: '#94a3b8',
        fontHeading: 'system-ui, -apple-system, sans-serif',
        fontBody: 'system-ui, -apple-system, sans-serif',
        radius: '4px',
        space: '16px',
      },
    },
    'minimal-max': {
      slug: 'minimal-max',
      name: 'Max Sterling',
      handle: '@minimalmax',
      headline: 'Essential Living Space Edit by Max',
      subheadline: 'Calm tactile objects crafted from linen, stone, and unlacquered raw materials.',
      ctaText: 'Explore Calm Spaces',
      heroImage: '/images/hero-minimal-max.jpg',
      offer: 'Enjoy 15% off deliberate essentials with code CALM15',
      bundleText: 'Quiet Morning Essentials Set · 15% Off',
      discountCode: 'CALM15',
      discountPercent: 15,
      testimonials: [],
      theme: {
        name: 'calm',
        bg: '#fafafa',
        fg: '#18181b',
        accent: '#52525b',
        cardBg: '#ffffff',
        border: '#e4e4e7',
        muted: '#71717a',
        fontHeading: 'system-ui, -apple-system, sans-serif',
        fontBody: 'system-ui, -apple-system, sans-serif',
        radius: '0px',
        space: '16px',
      },
    },
    'luxe-lena': {
      slug: 'luxe-lena',
      name: 'Lena Rostova',
      handle: '@luxelena',
      headline: 'The Haute Beauty Sanctuary Curated by Lena',
      subheadline: 'Potent peptide formulations and pure mulberry silk rituals designed for radiant rest.',
      ctaText: 'Acquire Lena’s Private Reserve',
      heroImage: '/images/hero-luxe-lena.jpg',
      offer: 'Receive 25% privilege savings with code LUXE25',
      bundleText: 'L’Édition Nocturne Luxury Suite · 25% Off',
      discountCode: 'LUXE25',
      discountPercent: 25,
      testimonials: [],
      theme: {
        name: 'gold',
        bg: '#090d16',
        fg: '#f8fafc',
        accent: '#f59e0b',
        cardBg: '#121826',
        border: '#1e293b',
        muted: '#94a3b8',
        fontHeading: 'Georgia, Cambria, "Times New Roman", Times, serif',
        fontBody: 'system-ui, -apple-system, sans-serif',
        radius: '2px',
        space: '16px',
      },
    },
    techtom: {
      slug: 'techtom',
      name: 'Tom Zhao',
      handle: '@techtom',
      headline: 'High-Density Desk & Travel Gear by Tom',
      subheadline: 'Precision-machined power, smart thermal monitoring, and low-latency acoustic fidelity.',
      ctaText: 'Upgrade Your Hardware Stack',
      heroImage: '/images/hero-techtom.jpg',
      offer: 'Deploy 10% code TECH10 on high-efficiency gadgets',
      bundleText: 'Nomad Workstation Power Stack · 10% Off',
      discountCode: 'TECH10',
      discountPercent: 10,
      testimonials: [],
      theme: {
        name: 'cyber',
        bg: '#0b0f19',
        fg: '#f1f5f9',
        accent: '#38bdf8',
        cardBg: '#131b2e',
        border: '#1e293b',
        muted: '#94a3b8',
        fontHeading: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        fontBody: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        radius: '6px',
        space: '16px',
      },
    },
  },
  themes: {},
  defaultTheme: {
    name: 'default',
    bg: '#ffffff',
    fg: '#0f172a',
    accent: '#2563eb',
    cardBg: '#f8fafc',
    border: '#e2e8f0',
    muted: '#64748b',
    fontHeading: 'system-ui, -apple-system, sans-serif',
    fontBody: 'system-ui, -apple-system, sans-serif',
    radius: '8px',
    space: '16px',
  },
  holdout: 10,
};

let _memoryCache: AuroraSiteConfig | null = null;
let _memoryCacheTime = 0;

export async function getAuroraSiteConfig(bypassCache = false): Promise<AuroraSiteConfig> {
  const now = Date.now();
  const maxAge = bypassCache ? 1500 : 30_000;
  if (_memoryCache && now - _memoryCacheTime < maxAge) {
    return _memoryCache;
  }

  const consoleUrl = process.env.VIBE_CONSOLE_URL || 'http://localhost:3000';
  const siteKey = process.env.NEXT_PUBLIC_VIBE_SITE_KEY || 'pk_live_aurora_2026';

  try {
    const fetchOptions: RequestInit = bypassCache
      ? { cache: 'no-store', signal: AbortSignal.timeout(5000) }
      : { next: { revalidate: 30 }, signal: AbortSignal.timeout(5000) };

    const res = await fetch(`${consoleUrl}/api/sites/config?site_key=${siteKey}`, fetchOptions);

    if (res.ok) {
      const data = await res.json();
      if (data && data.site) {
        _memoryCache = data as AuroraSiteConfig;
        _memoryCacheTime = Date.now();
        return _memoryCache;
      }
    }
  } catch (err) {
    // If dashboard console is starting or unreachable, use fallback or cached
    if (_memoryCache) return _memoryCache;
  }

  return FALLBACK_CONFIG;
}

