import type { ThemeTokens } from './types';

export const BUILTIN_THEMES: Record<string, ThemeTokens> = {
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    fontHeading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontBody: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    primaryColor: '#18181b', // zinc-900
    primaryColorHover: '#27272a',
    backgroundColor: '#ffffff',
    cardBackgroundColor: '#fafafa',
    textColor: '#18181b',
    textMutedColor: '#71717a',
    accentColor: '#52525b',
    borderRadius: '4px',
    imageTreatment: 'sharp',
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Editorial',
    fontHeading: '"Playfair Display", "Didot", serif',
    fontBody: '"Cinzel", "Bodoni MT", serif',
    primaryColor: '#b48a44', // warm antique gold
    primaryColorHover: '#987132',
    backgroundColor: '#0c0a09', // stone-950
    cardBackgroundColor: '#1c1917',
    textColor: '#f5f5f4', // stone-100
    textMutedColor: '#a8a29e',
    accentColor: '#d4af37',
    borderRadius: '0px',
    imageTreatment: 'sharp',
  },
  'bold-streetwear': {
    id: 'bold-streetwear',
    name: 'Bold Streetwear',
    fontHeading: '"Impact", "Syne", "Anton", sans-serif',
    fontBody: '"Space Grotesk", sans-serif',
    primaryColor: '#ff0033', // electric neon red
    primaryColorHover: '#d6002b',
    backgroundColor: '#09090b', // zinc-950
    cardBackgroundColor: '#18181b',
    textColor: '#ffffff',
    textMutedColor: '#a1a1aa',
    accentColor: '#00f0ff',
    borderRadius: '12px',
    imageTreatment: 'rounded',
  },
  playful: {
    id: 'playful',
    name: 'Playful Candy',
    fontHeading: '"Plus Jakarta Sans", "Fredoka", sans-serif',
    fontBody: '"Nunito", sans-serif',
    primaryColor: '#ec4899', // pink-500
    primaryColorHover: '#db2777',
    backgroundColor: '#fffdfa',
    cardBackgroundColor: '#fdf2f8',
    textColor: '#831843',
    textMutedColor: '#9d174d',
    accentColor: '#8b5cf6',
    borderRadius: '24px',
    imageTreatment: 'pill',
  },
  'fitness-energy': {
    id: 'fitness-energy',
    name: 'Fitness Energy',
    fontHeading: '"Oswald", "Barlow Condensed", sans-serif',
    fontBody: '"Roboto Condensed", sans-serif',
    primaryColor: '#84cc16', // lime-500
    primaryColorHover: '#65a30d',
    backgroundColor: '#050505',
    cardBackgroundColor: '#121212',
    textColor: '#f4f4f5',
    textMutedColor: '#a1a1aa',
    accentColor: '#eab308',
    borderRadius: '6px',
    imageTreatment: 'sharp',
  },
  editorial: {
    id: 'editorial',
    name: 'Magazine Editorial',
    fontHeading: '"Fraunces", "Georgia", serif',
    fontBody: '"Lora", serif',
    primaryColor: '#1c1917',
    primaryColorHover: '#292524',
    backgroundColor: '#fbfaf8',
    cardBackgroundColor: '#f5f4ef',
    textColor: '#292524',
    textMutedColor: '#78716c',
    accentColor: '#9a3412',
    borderRadius: '2px',
    imageTreatment: 'sharp',
  },
  'dark-tech': {
    id: 'dark-tech',
    name: 'Dark Tech Cyberspace',
    fontHeading: '"JetBrains Mono", monospace',
    fontBody: '"Geist", "Inter", sans-serif',
    primaryColor: '#06b6d4', // cyan-500
    primaryColorHover: '#0891b2',
    backgroundColor: '#030712', // gray-950
    cardBackgroundColor: '#111827',
    textColor: '#f9fafb',
    textMutedColor: '#9ca3af',
    accentColor: '#3b82f6',
    borderRadius: '8px',
    imageTreatment: 'rounded',
  },
  organic: {
    id: 'organic',
    name: 'Organic Earth',
    fontHeading: '"Cormorant Garamond", serif',
    fontBody: '"Outfit", sans-serif',
    primaryColor: '#2d6a4f', // deep forest green
    primaryColorHover: '#1b4332',
    backgroundColor: '#fefae0', // warm cream
    cardBackgroundColor: '#faedcd',
    textColor: '#283618',
    textMutedColor: '#606c38',
    accentColor: '#bc6c25',
    borderRadius: '16px',
    imageTreatment: 'rounded',
  },
};

/**
 * Converts Hex string to RGB numbers
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = Number.parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates relative luminance according to WCAG 2.1
 */
export function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const [sR, sG, sB] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Calculates WCAG contrast ratio between two hex colors
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  try {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const l1 = calculateRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = calculateRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 1.0;
  }
}

/**
 * Checks if a contrast ratio meets WCAG AA (>= 4.5 for normal text, >= 3.0 for large text)
 */
export function checkWcagAa(textColor: string, bgColor: string, isLargeText = false): {
  ratio: number;
  passes: boolean;
  required: number;
} {
  const ratio = calculateContrastRatio(textColor, bgColor);
  const required = isLargeText ? 3.0 : 4.5;
  return {
    ratio,
    passes: ratio >= required,
    required,
  };
}

/**
 * Auto-repairs failing contrast by shifting text color towards pure black (#000000) or pure white (#ffffff)
 */
export function repairContrast(textColor: string, bgColor: string): string {
  const current = checkWcagAa(textColor, bgColor);
  if (current.passes) return textColor;

  const bgRgb = hexToRgb(bgColor);
  const bgLuminance = calculateRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // If background is light, return dark text (#111827). If dark, return bright text (#f9fafb)
  return bgLuminance > 0.4 ? '#09090b' : '#fafafa';
}
