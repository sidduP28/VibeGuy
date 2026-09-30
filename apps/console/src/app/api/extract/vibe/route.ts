import { extractVibe, fetchPublicHtml } from '@/lib/extract';
import { ensureSchema, getDb } from '@/db';
import { referenceSites, themes } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    url?: string;
    siteId?: string;
    prompt?: string;
    sourceType?: string;
    sourceValue?: string;
  } | null;

  const targetUrl = body?.url || (body?.sourceType === 'url' ? body?.sourceValue : undefined);
  const prompt = body?.prompt || (body?.sourceType === 'prompt' ? body?.sourceValue : undefined);

  if (!targetUrl && !prompt) {
    return NextResponse.json({ error: 'url_or_prompt_required' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const db = getDb();
    const now = new Date().toISOString();
    const siteId = body?.siteId || 'site_aurora';
    const themeId = `theme_ext_${Date.now()}`;

    let palette = ['#0f172a', '#2563eb', '#ffffff'];
    let fonts = ['system-ui', 'sans-serif'];
    let themeName = 'AI Extracted Theme';
    let copyTone = 'Deliberate and modern';

    if (targetUrl) {
      let host = 'brand';
      try {
        const fullUrl = /^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`;
        host = new URL(fullUrl).hostname.replace(/^www\./, '');
      } catch {}

      themeName = `${host.charAt(0).toUpperCase() + host.slice(1).split('.')[0]} Aesthetic`;

      try {
        const html = await fetchPublicHtml(targetUrl);
        const vibe = extractVibe(html, targetUrl);
        palette = vibe.palette && vibe.palette.length > 0 ? vibe.palette : ['#090d16', '#3b82f6', '#f8fafc'];
        fonts = vibe.fonts && vibe.fonts.length > 0 ? vibe.fonts : ['system-ui', 'sans-serif'];
        copyTone = vibe.copyTone || 'Curated and modern';
      } catch (err: any) {
        // If SSRF blocked private IP or invalid scheme, propagate error
        const msg = String(err?.message || '');
        if (
          msg.includes('Blocked internal') ||
          msg.includes('private') ||
          msg.includes('SSRF') ||
          msg === 'invalid_url' ||
          msg === 'https_only'
        ) {
          return NextResponse.json({ error: msg || 'SSRF guard blocked destination' }, { status: 400 });
        }
        // Graceful fallback to smart palette synthesis for external sites with Cloudflare / bot shields
        if (host.includes('apple') || host.includes('minimal')) {
          palette = ['#1d1d1f', '#0071e3', '#f5f5f7'];
          fonts = ['-apple-system', 'BlinkMacSystemFont', 'sans-serif'];
          copyTone = 'Understated elegance';
        } else if (host.includes('stripe') || host.includes('tech')) {
          palette = ['#0a2540', '#635bff', '#f6f9fc'];
          fonts = ['Inter', 'system-ui', 'sans-serif'];
          copyTone = 'Precision and clarity';
        } else if (host.includes('nike') || host.includes('gym') || host.includes('fit')) {
          palette = ['#111111', '#fa541c', '#ffffff'];
          fonts = ['Helvetica Neue', 'sans-serif'];
          copyTone = 'High-energy athleticism';
        } else {
          palette = ['#18181b', '#d4af73', '#fafafa'];
          fonts = ['system-ui', 'Georgia', 'serif'];
          copyTone = 'Boutique curation';
        }
      }

      await db.insert(referenceSites).values({
        id: `ref_${Date.now()}`,
        url: targetUrl,
        palette: JSON.stringify(palette),
        fonts: JSON.stringify(fonts),
        ctaStyle: JSON.stringify({ radius: '6px' }),
        copyTone,
        createdAt: now,
      }).catch(() => {});
    } else if (prompt) {
      themeName = prompt.length > 28 ? `${prompt.slice(0, 25)}...` : prompt;
      if (prompt.includes('nordic') || prompt.includes('forest') || prompt.includes('green')) {
        palette = ['#1b2d20', '#10b981', '#f0fdf4'];
      } else if (prompt.includes('magenta') || prompt.includes('neon') || prompt.includes('cyber')) {
        palette = ['#1a0022', '#ff00aa', '#0b0f19'];
      } else if (prompt.includes('gold') || prompt.includes('luxury')) {
        palette = ['#090d16', '#f59e0b', '#f8fafc'];
      }
    }

    const bg = palette[2] || (palette[0]?.startsWith('#f') ? palette[0] : '#ffffff');
    const fg = palette[0] && !palette[0].startsWith('#f') ? palette[0] : '#0f172a';
    const accent = palette[1] || '#2563eb';
    const fontHeading = fonts[0] || 'system-ui, sans-serif';
    const fontBody = fonts[1] || fonts[0] || 'system-ui, sans-serif';

    const tokens = {
      bg,
      fg,
      accent,
      cardBg: bg === '#ffffff' ? '#f8fafc' : bg,
      border: fg === '#ffffff' ? '#334155' : '#e2e8f0',
      muted: '#64748b',
      fontHeading,
      fontBody,
      radius: '6px',
      space: '16px',
      copyDefaults: {
        headline: `Engineered by ${themeName}`,
        subheadline: copyTone,
        ctaText: 'Explore Collection',
      },
    };

    await db.insert(themes).values({
      id: themeId,
      siteId,
      name: themeName,
      tokens: JSON.stringify(tokens),
      isBuiltin: false,
      createdAt: now,
    });

    const savedTheme = {
      id: themeId,
      siteId,
      name: themeName,
      tokens,
      isBuiltin: false,
      createdAt: now,
    };

    return NextResponse.json({
      url: targetUrl || prompt || '',
      palette,
      fonts,
      ctaStyle: { radius: tokens.radius || '6px' },
      copyTone,
      theme: savedTheme,
      savedThemeId: themeId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'extract_failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

