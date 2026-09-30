import { VibeProvider, VibeSlot } from '@vibe/react';
import { headers } from 'next/headers';
import Script from 'next/script';

// Creator profile map — in production this comes from your API
const CREATOR_PROFILES: Record<string, {
  vibeCode: string;
  headline: string;
  subheadline: string;
  cta: string;
  hero: string;
  offer: string;
  testimonial: string;
  theme: { bg: string; text: string; primary: string; accent: string };
}> = {
  fit2026: {
    vibeCode: 'fit2026',
    headline: 'Fuel Like Alex Rivera: Peak Athletic Performance',
    subheadline: "The exact hydration and mitochondrial stack powering Alex's 5:00 AM heavy barbell sessions.",
    cta: 'Claim The Alex Rivera Stack',
    hero: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
    offer: '20% OFF Creator Exclusive Bundle + Free Shaker',
    testimonial: 'This formula completely rewired my morning training blocks. Zero jitter crash, 100% clean output. — Alex Rivera (Verified Athlete)',
    theme: { bg: '#050505', text: '#f4f4f5', primary: '#b5f23d', accent: '#8ab52e' },
  },
  minimal2026: {
    vibeCode: 'minimal2026',
    headline: 'Designed with Marcus Chen: Zero Distraction Workspaces',
    subheadline: 'Eliminate visual clutter. Engineered for developers and creators who demand absolute focus.',
    cta: 'Explore The Minimal Desk',
    hero: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    offer: '15% OFF for Marcus Chen Subscribers',
    testimonial: 'Zero friction, zero bloat. The only gear on my desk that earned permanent real estate. — Marcus Chen (Staff Architect)',
    theme: { bg: '#f7f7f5', text: '#111111', primary: '#111111', accent: '#888888' },
  },
  lux2026: {
    vibeCode: 'lux2026',
    headline: 'The Elena Rostova Edit: Uncompromising Craftsmanship',
    subheadline: 'Curated exclusively for patrons of quiet elegance. Limited batch formulation.',
    cta: "Acquire Elena's Private Reserve",
    hero: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
    offer: 'Complimentary Bespoke Travel Atomizer',
    testimonial: 'Impeccable craftsmanship. A rare harmony of artisanal discipline and understated grace. — Elena Rostova (Luxury Editor)',
    theme: { bg: '#0e0b07', text: '#f4ede0', primary: '#c4a055', accent: '#8a7045' },
  },
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Server-side creator detection from searchParams → 0 hydration mismatch
  const sp = await searchParams;
  const vibeCode = sp.vibe?.toLowerCase() ?? sp.utm_source ?? '';
  const profile = CREATOR_PROFILES[vibeCode];

  const slots = profile
    ? {
        headline: profile.headline,
        subheadline: profile.subheadline,
        cta: profile.cta,
        'hero-image': profile.hero,
        offer: profile.offer,
        testimonial: profile.testimonial,
      }
    : {};

  const themeStyle = profile?.theme
    ? ({
        '--vibe-bg': profile.theme.bg,
        '--vibe-text': profile.theme.text,
        '--vibe-primary': profile.theme.primary,
        '--vibe-accent': profile.theme.accent,
      } as React.CSSProperties)
    : {};

  return (
    <VibeProvider
      initialProfile={
        profile
          ? {
              vibeCode: profile.vibeCode,
              headline: profile.headline,
              subheadline: profile.subheadline,
              cta: profile.cta,
              hero: profile.hero,
              offer: profile.offer,
            }
          : null
      }
    >
      {/* G4: title and canonical are generic — never personalized */}
      <html lang="en" data-vibe-ssr={profile ? '1' : undefined}>
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Apex Performance Store</title>
          <meta name="description" content="Premium performance supplements and gear for serious athletes." />
          <link rel="canonical" href="https://store.example.com/" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600&display=swap"
            rel="stylesheet"
          />
          {/* SDK loads but skips DOM ops when data-vibe-ssr="1" */}
          <Script src="http://localhost:3000/api/sdk/site_demo" strategy="beforeInteractive" />
          <style>{`
            :root{--vibe-bg:#0a0a0a;--vibe-text:#f4f4f5;--vibe-primary:#fff;--vibe-accent:#888;--vibe-radius:2px}
            *{box-sizing:border-box;margin:0}
            body{font-family:Inter,system-ui,sans-serif;background:#f9f9f7;color:#111}
            a{text-decoration:none;color:inherit}
            img{max-width:100%;display:block}
            .nav{border-bottom:1px solid #e8e8e4;background:#fff;position:sticky;top:0;z-index:10}
            .nav-i{max-width:1200px;margin:0 auto;padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between}
            .logo{font-weight:700;font-size:1rem;letter-spacing:.1em}
            .nav-a{display:flex;gap:18px;font-size:13px;color:#666}
            .nav-a a:hover{color:#111}
            .offer{background:var(--vibe-primary,#111);color:var(--vibe-bg,#f4f4f5);text-align:center;padding:8px;font-size:13px;font-weight:500}
            .hero{display:grid;grid-template-columns:1fr 1fr;min-height:80vh}
            .hero-img{overflow:hidden;background:#c9c2b2}
            .hero-img img{width:100%;height:100%;object-fit:cover}
            .hero-c{padding:60px 56px;display:flex;flex-direction:column;justify-content:center;background:var(--vibe-bg,#fff);color:var(--vibe-text,#111);transition:background .4s,color .3s}
            .eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:var(--vibe-accent,#888);margin-bottom:14px}
            h1{font-family:'Playfair Display',serif;font-size:clamp(1.7rem,3.5vw,2.7rem);line-height:1.1;letter-spacing:-.025em;margin-bottom:14px;color:var(--vibe-text,#111)}
            .sub{font-size:.95rem;line-height:1.65;color:var(--vibe-accent,#666);max-width:42ch;margin-bottom:24px}
            .btn-p{display:inline-flex;align-items:center;padding:12px 22px;background:var(--vibe-primary,#111);color:var(--vibe-bg,#fff);border-radius:var(--vibe-radius,2px);font-size:14px;font-weight:500;cursor:pointer;border:none;transition:opacity .15s}
            .btn-p:hover{opacity:.85}
            .ts{background:var(--vibe-bg,#f4f4f5);color:var(--vibe-text,#111);padding:60px 24px;text-align:center;transition:background .4s,color .3s}
            blockquote{font-family:'Playfair Display',serif;font-size:1.25rem;line-height:1.55;max-width:600px;margin:0 auto;font-style:italic;border:none}
            blockquote footer{margin-top:14px;font-size:12px;font-style:normal;color:var(--vibe-accent,#888);font-family:Inter,sans-serif}
            footer.foot{border-top:1px solid #e8e8e4;padding:24px;text-align:center;font-size:11px;color:#aaa}
            @media(max-width:768px){.hero{grid-template-columns:1fr}.hero-img{min-height:220px}.hero-c{padding:36px 20px}.nav-a a:not(:last-child){display:none}}
          `}</style>
        </head>
        <body style={themeStyle}>
          <nav className="nav">
            <div className="nav-i">
              <span className="logo">APEX</span>
              <div className="nav-a">
                <a href="/collections">Collections</a>
                <a href="/science">Science</a>
                <a href="/about">About</a>
              </div>
            </div>
          </nav>

          {/* Offer banner — personalized */}
          <VibeSlot name="offer" tag="div" className="offer" />

          <section className="hero">
            <div className="hero-img">
              <VibeSlot name="hero-image" tag="div">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80" alt="Performance athlete" />
              </VibeSlot>
            </div>
            <div className="hero-c">
              <span className="eyebrow">Performance nutrition · 2026</span>
              <VibeSlot name="headline" tag="h1">
                Engineered for Those Who Never Stop.
              </VibeSlot>
              <VibeSlot name="subheadline" tag="p" className="sub">
                Performance nutrition and gear built for athletes who demand more from every session.
              </VibeSlot>
              <VibeSlot name="cta" tag="a" href="/shop" className="btn-p">
                Shop Collection
              </VibeSlot>
            </div>
          </section>

          <section className="ts">
            <VibeSlot name="testimonial" tag="blockquote">
              <p>"The quality speaks for itself."</p>
              <footer>— Verified Athlete</footer>
            </VibeSlot>
          </section>

          <footer className="foot">
            Next.js store · @vibe/react SSR · data-vibe-ssr=&quot;1&quot; → client SDK skips DOM ops ·{' '}
            {profile ? `Personalized for ?vibe=${vibeCode}` : 'Generic (no creator detected)'}
          </footer>
        </body>
      </html>
    </VibeProvider>
  );
}
