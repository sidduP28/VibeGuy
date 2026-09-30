export interface CreatorTheme {
  name: string;
  bg: string;
  fg: string;
  accent: string;
  cardBg: string;
  border: string;
  muted: string;
  fontHeading: string;
  fontBody: string;
  radius: string;
}

export interface CreatorTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface CreatorProfile {
  slug: string;
  name: string;
  handle: string;
  discountCode: string;
  discountPercent: number;
  category: 'fitness' | 'minimalist-home' | 'luxury-beauty' | 'tech-gadgets';
  theme: CreatorTheme;
  headline: string;
  subheadline: string;
  ctaText: string;
  heroImage: string;
  offer: string;
  bundleText: string;
  testimonials: [CreatorTestimonial, CreatorTestimonial];
}

export const DEFAULT_THEME: CreatorTheme = {
  name: 'default',
  bg: '#ffffff',
  fg: '#0f172a',
  accent: '#2563eb',
  cardBg: '#f8fafc',
  border: '#e2e8f0',
  muted: '#64748b',
  fontHeading: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontBody: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  radius: '8px',
};

export const CREATORS: Record<string, CreatorProfile> = {
  fitfiona: {
    slug: 'fitfiona',
    name: 'Fiona Vance',
    handle: '@fitfiona',
    discountCode: 'FIT20',
    discountPercent: 20,
    category: 'fitness',
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
    },
    headline: 'High-Impact Performance Gear Curated by Fiona',
    subheadline: 'Engineered training essentials tested across 500+ intense conditioning and barbell sessions.',
    ctaText: 'Shop Fiona’s Training Kit',
    heroImage: '/images/hero-fitfiona.jpg',
    offer: 'Save 20% on Fiona’s Athletic Picks with code FIT20',
    bundleText: 'Complete Conditioning Bundle · Save 20%',
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
  },
  'minimal-max': {
    slug: 'minimal-max',
    name: 'Max Sterling',
    handle: '@minimalmax',
    discountCode: 'CALM15',
    discountPercent: 15,
    category: 'minimalist-home',
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
    },
    headline: 'Essential Living Space Edit by Max',
    subheadline: 'Calm tactile objects crafted from linen, stone, and unlacquered raw materials.',
    ctaText: 'Explore Calm Spaces',
    heroImage: '/images/hero-minimal-max.jpg',
    offer: 'Enjoy 15% off deliberate essentials with code CALM15',
    bundleText: 'Quiet Morning Essentials Set · 15% Off',
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
  },
  'luxe-lena': {
    slug: 'luxe-lena',
    name: 'Lena Rostova',
    handle: '@luxelena',
    discountCode: 'LUXE25',
    discountPercent: 25,
    category: 'luxury-beauty',
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
    },
    headline: 'The Haute Beauty Sanctuary Curated by Lena',
    subheadline: 'Potent peptide formulations and pure mulberry silk rituals designed for radiant rest.',
    ctaText: 'Acquire Lena’s Private Reserve',
    heroImage: '/images/hero-luxe-lena.jpg',
    offer: 'Receive 25% privilege savings with code LUXE25',
    bundleText: 'L’Édition Nocturne Luxury Suite · 25% Off',
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
  },
  techtom: {
    slug: 'techtom',
    name: 'Tom Zhao',
    handle: '@techtom',
    discountCode: 'TECH10',
    discountPercent: 10,
    category: 'tech-gadgets',
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
    },
    headline: 'High-Density Desk & Travel Gear by Tom',
    subheadline: 'Precision-machined power, smart thermal monitoring, and low-latency acoustic fidelity.',
    ctaText: 'Upgrade Your Hardware Stack',
    heroImage: '/images/hero-techtom.jpg',
    offer: 'Deploy 10% code TECH10 on high-efficiency gadgets',
    bundleText: 'Nomad Workstation Power Stack · 10% Off',
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
  },
};

export const ALLOWED_CREATOR_SLUGS = Object.keys(CREATORS);
