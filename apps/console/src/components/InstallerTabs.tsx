'use client';

import { useState } from 'react';

const SHOPIFY_SNIPPET = (siteId: string) => `{%- comment -%}VibePersonalize — paste in theme.liquid <head>{%- endcomment -%}
<script src="{{ 'https://your-console.vercel.app/api/sdk/${siteId}' }}" defer></script>`;

const WEBFLOW_SNIPPET = (siteId: string) => `<!-- VibePersonalize — add in Webflow > Project Settings > Custom Code > Head -->
<script src="https://your-console.vercel.app/api/sdk/${siteId}" defer></script>`;

const REACT_SNIPPET = (siteId: string) => `// In Next.js layout.tsx or _document.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://your-console.vercel.app/api/sdk/${siteId}"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`;

const SLOT_SNIPPET = `<!-- Add data-vibe-slot attributes to your existing HTML elements -->
<h1 data-vibe-slot="headline">Your default headline</h1>
<p  data-vibe-slot="subheadline">Your default subheadline</p>
<a  data-vibe-slot="cta" href="/shop">Shop Now</a>
<div data-vibe-slot="hero-image"><img src="/default-hero.jpg" /></div>
<div data-vibe-slot="offer"><!-- offer banner --></div>
<div data-vibe-slot="testimonial"><!-- testimonial --></div>`;

export function InstallerTabs({ siteId }: { siteId: string }) {
  const [tab, setTab] = useState<'shopify' | 'webflow' | 'react' | 'slots'>('shopify');
  const [copied, setCopied] = useState('');

  const snippets = {
    shopify: SHOPIFY_SNIPPET(siteId),
    webflow: WEBFLOW_SNIPPET(siteId),
    react: REACT_SNIPPET(siteId),
    slots: SLOT_SNIPPET,
  };

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div>
      <div className="tabs">
        {(['shopify', 'webflow', 'react', 'slots'] as const).map((t) => (
          <button
            key={t}
            className={`btn ${tab === t ? '' : 'ghost'}`}
            style={{ fontSize: 12, textTransform: 'capitalize' }}
            onClick={() => setTab(t)}
          >
            {t === 'react' ? 'Next.js / React' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <pre className="code" style={{ fontSize: 12 }}>{snippets[tab]}</pre>
        <button
          className="btn"
          style={{ position: 'absolute', top: 8, right: 8, fontSize: 11 }}
          onClick={() => copy(snippets[tab], tab)}
        >
          {copied === tab ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {tab !== 'slots' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="kicker">What this does</p>
          <ul style={{ margin: '8px 0 0', padding: '0 0 0 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            <li>Loads the personalization config for all active campaigns (&lt;3KB gzipped)</li>
            <li>Detects creator from <code>?vibe=</code>, <code>utm_source=</code>, or referrer</li>
            <li>Hides slots using <code>visibility:hidden</code> (0 CLS), swaps content via <code>textContent</code></li>
            <li>Reveals in &lt;50ms p95; 300ms fail-safe always reveals the generic page</li>
            <li>Sends a beacon to <code>/api/collect</code> with execMs + CLS metrics</li>
            <li>Bots (Googlebot, Bingbot) and search crawlers always see the generic page</li>
          </ul>
        </div>
      )}

      <div className="card">
        <p className="kicker">Guardrail compliance</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
          {[
            ['G1', 'SDK ≤3KB gzip', 'var(--ok)'],
            ['G2', '0 CLS (visibility-only)', 'var(--ok)'],
            ['G3', '300ms fail-safe fallback', 'var(--ok)'],
            ['G4', 'Title/canonical untouched', 'var(--ok)'],
            ['G5', 'textContent only, SSRF guard', 'var(--ok)'],
            ['Bot', 'Crawlers pass through', 'var(--ok)'],
          ].map(([id, label, color]) => (
            <div key={id} style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: color as string, fontSize: 14 }}>✓</span>
              <span><strong>{id}:</strong> {label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
