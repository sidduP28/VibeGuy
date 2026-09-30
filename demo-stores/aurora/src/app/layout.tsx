import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { VibeProvider } from '@vibe/react';
import { themeToCssVars } from '@vibe/core';
import { StoreProvider } from '../context/StoreContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PreviewSwitcher } from '../components/PreviewSwitcher';
import { DebugBadge } from '../components/DebugBadge';
import { LivePreviewListener } from '../components/LivePreviewListener';
import { getAuroraSiteConfig } from '../lib/site-config';

export const metadata: Metadata = {
  title: 'Aurora Store — Curated Minimal Objects · VibeGuy',
  description: 'A boutique design atelier with personalized creator curation powered by VibeGuy.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();

  const decodeHeader = (val: string | null | undefined): string => {
    if (!val) return '';
    try {
      return decodeURIComponent(val);
    } catch {
      return val;
    }
  };

  const vibeSlug = decodeHeader(headersList.get('x-aurora-vibe')) || null;
  const visitorId = decodeHeader(headersList.get('x-aurora-visitor')) || 'vis_anon';
  const group = decodeHeader(headersList.get('x-aurora-group')) || 'treatment';
  const isDebug = decodeHeader(headersList.get('x-aurora-debug')) === '1';

  const isBypass =
    decodeHeader(headersList.get('x-aurora-force')) === '1' ||
    decodeHeader(headersList.get('x-aurora-preview')) === '1' ||
    decodeHeader(headersList.get('x-aurora-debug')) === '1';

  // Fetch dynamic multi-tenant site config with 30s TTL (bypass in dev/force/preview)
  const siteConfig = await getAuroraSiteConfig(isBypass);

  // Support live draft theme overrides (used by Builder iframe preview)
  let draftTheme: any = null;
  const draftThemeHeader = decodeHeader(headersList.get('x-aurora-draft-theme'));
  if (draftThemeHeader) {
    try {
      draftTheme = JSON.parse(decodeURIComponent(draftThemeHeader));
    } catch {
      try {
        draftTheme = JSON.parse(draftThemeHeader);
      } catch {
        const rawKey = draftThemeHeader.trim().toLowerCase();
        const found =
          siteConfig.themes[draftThemeHeader] ||
          siteConfig.themes[rawKey] ||
          Object.values(siteConfig.themes).find((t: any) =>
            t.id?.toLowerCase() === rawKey ||
            t.themeKey?.toLowerCase() === rawKey ||
            t.name?.toLowerCase().includes(rawKey)
          );
        if (found) {
          draftTheme = found;
        } else {
          const BUILTIN_PRESETS: Record<string, any> = {
            energy: {
              name: 'High-Impact Fitness',
              themeKey: 'energy',
              bg: '#0f172a',
              fg: '#f8fafc',
              accent: '#22c55e',
              cardBg: '#1e293b',
              border: '#334155',
              muted: '#94a3b8',
              fontHeading: 'system-ui, sans-serif',
              fontBody: 'system-ui, sans-serif',
              radius: '4px',
              space: '16px',
            },
            calm: {
              name: 'Calm Architectural',
              themeKey: 'calm',
              bg: '#fafafa',
              fg: '#18181b',
              accent: '#52525b',
              cardBg: '#ffffff',
              border: '#e4e4e7',
              muted: '#71717a',
              fontHeading: 'system-ui, sans-serif',
              fontBody: 'system-ui, sans-serif',
              radius: '0px',
              space: '16px',
            },
            gold: {
              name: 'Quiet Luxury Gold',
              themeKey: 'gold',
              bg: '#090d16',
              fg: '#f8fafc',
              accent: '#f59e0b',
              cardBg: '#121826',
              border: '#1e293b',
              muted: '#94a3b8',
              fontHeading: 'Georgia, Cambria, serif',
              fontBody: 'system-ui, sans-serif',
              radius: '2px',
              space: '16px',
            },
            cyber: {
              name: 'Dark Cyber Hardware',
              themeKey: 'cyber',
              bg: '#0b0f19',
              fg: '#f1f5f9',
              accent: '#38bdf8',
              cardBg: '#131b2e',
              border: '#1e293b',
              muted: '#94a3b8',
              fontHeading: 'system-ui, sans-serif',
              fontBody: 'monospace',
              radius: '6px',
              space: '16px',
            },
          };
          for (const [k, preset] of Object.entries(BUILTIN_PRESETS)) {
            if (rawKey.includes(k)) {
              draftTheme = preset;
              break;
            }
          }
        }
      }
    }
  }

  // Extract draft slots (passed by Campaign Builder live preview)
  let draftSlots: any = null;
  const draftSlotsHeader = decodeHeader(headersList.get('x-aurora-draft-slots'));
  if (draftSlotsHeader) {
    try {
      draftSlots = JSON.parse(draftSlotsHeader);
    } catch {
      try {
        draftSlots = JSON.parse(decodeURIComponent(draftSlotsHeader));
      } catch {}
    }
  }

  const profile = vibeSlug && siteConfig.creators[vibeSlug] ? siteConfig.creators[vibeSlug] : null;
  const activeTheme = draftTheme || (profile ? profile.theme : siteConfig.defaultTheme);

  const initialProfile = (profile || draftSlots)
    ? {
        creatorId: profile?.slug || 'preview_creator',
        campaignId: `cmp_${profile?.slug || 'preview'}`,
        slots: {
          headline: draftSlots?.headline !== undefined && draftSlots.headline !== '' ? draftSlots.headline : (profile?.headline || 'Deliberate Objects Engineered for Precision Living'),
          subheadline: draftSlots?.subheadline !== undefined && draftSlots.subheadline !== '' ? draftSlots.subheadline : (profile?.subheadline || 'Tactile home goods, performance conditioning tools, and high-density tech essentials crafted to eliminate daily friction.'),
          cta: draftSlots?.cta !== undefined && draftSlots.cta !== '' ? draftSlots.cta : (profile?.ctaText || 'Shop Collection'),
          'hero-image': draftSlots?.hero !== undefined && draftSlots.hero !== '' ? draftSlots.hero : (profile?.heroImage || '/images/hero-fitfiona.jpg'),
          offer: draftSlots?.offer !== undefined && draftSlots.offer !== '' ? draftSlots.offer : (profile?.offer || ''),
          testimonial: profile?.testimonials?.[0]?.quote || '',
          bundle: profile?.bundleText || '',
        },
        themeTokens: {
          bg: activeTheme.bg || activeTheme.tokens?.bg,
          fg: activeTheme.fg || activeTheme.tokens?.fg,
          accent: activeTheme.accent || activeTheme.tokens?.accent,
        },
      }
    : null;

  const dynamicStyle = themeToCssVars(activeTheme) as React.CSSProperties;

  return (
    <html
      lang="en"
      data-theme={activeTheme.themeKey || activeTheme.name || 'default'}
      data-vibe-ssr={profile ? '1' : undefined}
      style={dynamicStyle}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <LivePreviewListener />
        <VibeProvider
          siteId={siteConfig.site.id}
          publicKey={siteConfig.site.siteKey}
          initialProfile={initialProfile}
        >
          <StoreProvider
            creatorSlug={profile ? profile.slug : null}
            visitorId={visitorId}
            group={group}
          >
            <Navbar creatorSlug={profile ? profile.slug : null} />
            <main className="flex-1 w-full">{children}</main>
            <Footer creatorSlug={profile ? profile.slug : null} />
            <PreviewSwitcher
              activeSlug={profile ? profile.slug : null}
              creators={siteConfig.creators}
            />
            {isDebug && (
              <DebugBadge
                creatorSlug={profile ? profile.slug : null}
                group={group}
              />
            )}
          </StoreProvider>
        </VibeProvider>
      </body>
    </html>
  );
}
