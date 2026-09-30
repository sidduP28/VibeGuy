'use client';

import React, { useState } from 'react';

const CREATOR_LINKS = [
  { slug: 'fitfiona',    label: 'Fiona Vance',    niche: 'Fitness',  accent: '#22c55e', bg: '#0f172a', code: 'FIT20'  },
  { slug: 'minimal-max', label: 'Max Sterling',   niche: 'Minimal',  accent: '#52525b', bg: '#fafafa', code: 'CALM15' },
  { slug: 'luxe-lena',  label: 'Lena Rostova',   niche: 'Luxury',   accent: '#f59e0b', bg: '#090d16', code: 'LUXE25' },
  { slug: 'techtom',    label: 'Tom Zhao',        niche: 'Tech',     accent: '#38bdf8', bg: '#0b0f19', code: 'TECH10' },
];

type TabId = 'script' | 'slots' | 'links';

const STEPS: { id: TabId; num: string; title: string }[] = [
  { id: 'script', num: '01', title: 'Drop SDK script in <head>' },
  { id: 'slots',  num: '02', title: 'Add slot attributes to HTML' },
  { id: 'links',  num: '03', title: 'Share creator vibe links' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      style={{
        position: 'absolute', top: 10, right: 10,
        background: copied ? '#22c55e22' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${copied ? '#22c55e55' : 'rgba(255,255,255,0.12)'}`,
        color: copied ? '#22c55e' : 'rgba(255,255,255,0.55)',
        padding: '3px 10px', borderRadius: 4, fontSize: 11,
        cursor: 'pointer', fontFamily: 'ui-monospace, monospace',
        transition: 'all 0.2s',
      }}
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}

const SCRIPT_CODE = `// In Next.js layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* VibeGuy — paste once, personalize everywhere */}
        <Script
          src="http://localhost:3000/api/sdk/site_demo"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

// — or plain HTML / Shopify / Webflow —
<script
  src="http://localhost:3000/api/sdk/site_demo"
  defer
></script>`;

const SLOTS_CODE = `<!-- Add data-vibe-slot to your existing HTML.
     The SDK swaps content in <50ms with 0 CLS. -->

<h1 data-vibe-slot="headline">
  Default headline
</h1>

<p data-vibe-slot="subheadline">
  Default subheadline
</p>

<a data-vibe-slot="cta" href="/shop">
  Shop Now
</a>

<img data-vibe-slot="hero-image" src="/default.jpg" />

<div data-vibe-slot="offer"></div>

<div data-vibe-slot="testimonial"></div>`;

function CodePanel({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <div style={{ position: 'relative' }}>
      <CopyButton text={code} />
      <div style={{
        background: '#0a0e1a',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'auto',
        maxHeight: 360,
        padding: '20px 16px 20px 0',
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, lineHeight: 1.65 }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} style={{ verticalAlign: 'top' }}>
                <td style={{
                  textAlign: 'right', paddingRight: 16, paddingLeft: 14,
                  color: 'rgba(255,255,255,0.18)', fontFamily: 'ui-monospace, monospace',
                  userSelect: 'none', minWidth: 36, fontSize: 11,
                }}>
                  {i + 1}
                </td>
                <td style={{ paddingRight: 20, whiteSpace: 'pre', fontFamily: 'ui-monospace, monospace' }}>
                  <SyntaxLine line={line} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SyntaxLine({ line }: { line: string }) {
  // Very lightweight syntax highlight: comments, strings, keywords, attributes
  const highlighted = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Comments
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|&lt;!--[\s\S]*?--&gt;)/g,
      '<span style="color:#6272a4">$1</span>')
    // Strings
    .replace(/("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/g,
      '<span style="color:#f1fa8c">$1</span>')
    // Keywords
    .replace(/\b(import|from|export|default|function|return|const|let|var)\b/g,
      '<span style="color:#ff79c6">$1</span>')
    // JSX props / data-attributes
    .replace(/\b(data-vibe-slot|src|href|strategy|defer)=/g,
      '<span style="color:#50fa7b">$1</span>=')
    // Component names
    .replace(/(&lt;\/?)(Script|html|head|body|img|div|p|a|h1)(\b)/g,
      '$1<span style="color:#8be9fd">$2</span>$3');

  return <span style={{ color: '#f8f8f2' }} dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

export function InstallShowcase({ storeHost = 'http://localhost:3002' }: { storeHost?: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('script');
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (url: string, key: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  return (
    <section
      style={{
        background: '#080c16',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '72px 0',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 999, padding: '4px 14px', marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
            <span style={{ color: '#38bdf8', fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: 2 }}>
              SDK INSTALLATION
            </span>
          </div>
          <h2 style={{
            color: '#f8fafc', fontSize: 'clamp(24px,3.5vw,40px)',
            fontWeight: 800, margin: '0 0 12px', letterSpacing: -1, lineHeight: 1.1,
          }}>
            Integrate VibeGuy in 3 steps
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
            One script tag. Zero build changes. Creator-personalized content swaps in &lt;50ms
            with 0 layout shift, working on any stack.
          </p>
        </div>

        {/* Performance pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
          {[
            { label: '< 3KB gzip', sub: 'SDK size' },
            { label: '< 50ms', sub: 'CPU budget' },
            { label: '0 CLS', sub: 'layout shift' },
            { label: '0 deps', sub: 'no libraries' },
            { label: 'SSR safe', sub: 'bot-invisible' },
          ].map((p) => (
            <div key={p.label} style={{
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 6,
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
              <span style={{ color: '#22c55e', fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12 }}>{p.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{p.sub}</span>
            </div>
          ))}
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 20px 12px',
                borderBottom: activeTab === s.id ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeTab === s.id ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ opacity: 0.45 }}>{s.num}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ paddingTop: 24 }}>
          {activeTab === 'script' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              <div>
                <CodePanel code={SCRIPT_CODE} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                  borderRadius: 8, padding: '16px 20px',
                }}>
                  <div style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>HOW IT WORKS</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      'Reads ?vibe=, ?ref=, utm_source, or referrer to detect creator',
                      'Hashes visitor ID for A/B holdout (never fingerprints)',
                      'Swaps all data-vibe-slot elements in <50ms',
                      'Bot-invisible: Googlebot, Bingbot see only default content',
                      'Sends beacon to /api/collect — zero third-party calls',
                    ].map((t) => (
                      <li key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                        <span style={{ color: '#22c55e', marginTop: 1, flexShrink: 0 }}>✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{
                  background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)',
                  borderRadius: 8, padding: '14px 18px',
                }}>
                  <div style={{ color: '#38bdf8', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>SDK ENDPOINT</div>
                  <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#f1fa8c', display: 'block', wordBreak: 'break-all' }}>
                    http://localhost:3000/api/sdk/site_demo
                  </code>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>
                    Replace <code style={{ color: '#f59e0b' }}>site_demo</code> with your site ID from the console.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'slots' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              <div>
                <CodePanel code={SLOTS_CODE} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7 }}>
                  Add <code style={{ color: '#50fa7b', fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>data-vibe-slot</code> to
                  any existing element. The SDK will swap its content when a creator is detected.
                  Your default content is preserved for all other visitors.
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 2 }}>
                    AVAILABLE SLOTS
                  </div>
                  {[
                    { name: 'headline',    desc: 'Main H1 heading text',        color: '#ff79c6' },
                    { name: 'subheadline', desc: 'Subtitle / lede paragraph',   color: '#8be9fd' },
                    { name: 'cta',         desc: 'CTA button text + href',      color: '#50fa7b' },
                    { name: 'hero-image',  desc: 'Hero image src URL',          color: '#f1fa8c' },
                    { name: 'offer',       desc: 'Promo banner / offer text',   color: '#ffb86c' },
                    { name: 'testimonial', desc: 'Quote / social proof text',   color: '#bd93f9' },
                    { name: 'bundle',      desc: 'Bundle deal label',           color: '#ff5555' },
                  ].map((slot) => (
                    <div key={slot.name} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: slot.color }}>
                        {slot.name}
                      </code>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{slot.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}



          {activeTab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* VibeDNA redirect card */}
              <div style={{
                background: 'rgba(56,189,248,0.06)',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: 10, padding: '24px 28px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
                    🔗 Creator Vibe Links live in VibeDNA
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0, maxWidth: 500, lineHeight: 1.7 }}>
                    The VibeGuy Console is the single source of truth for all creator vibe links.
                    Go to <strong style={{ color: '#f1fa8c' }}>VibeDNA → Vibe Links tab</strong> to copy
                    shareable <code style={{ color: '#50fa7b', fontSize: 12 }}>?vibe=</code>,{' '}
                    <code style={{ color: '#50fa7b', fontSize: 12 }}>?ref=</code>, and UTM URLs for each creator.
                    Any edits you make to a creator there are instantly reflected here.
                  </p>
                </div>
                <a
                  href="http://localhost:3000/vibedna"
                  target="_blank"
                  rel="noopener"
                  style={{
                    background: '#38bdf8', color: '#080c16',
                    padding: '12px 24px', borderRadius: 6,
                    fontWeight: 800, fontSize: 13, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Open VibeDNA ↗
                </a>
              </div>

              {/* URL anatomy diagram */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '20px 24px',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>URL ANATOMY</div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, lineHeight: 2 }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>https://your-store.com</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                  <span style={{ color: '#f1fa8c' }}>?vibe=</span>
                  <span style={{ color: '#50fa7b' }}>fitfiona</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}> · or · </span>
                  <span style={{ color: '#f1fa8c' }}>?ref=</span>
                  <span style={{ color: '#50fa7b' }}>fitfiona</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}> · or · </span>
                  <span style={{ color: '#f1fa8c' }}>?utm_content=</span>
                  <span style={{ color: '#50fa7b' }}>fitfiona</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { param: '?vibe=', desc: 'Primary creator param' },
                    { param: '?ref=', desc: 'Affiliate / referral param' },
                    { param: '?utm_source= + ?utm_campaign=', desc: 'UTM attribution' },
                    { param: 'referrer', desc: 'Auto-detect from referrer URL' },
                  ].map((p) => (
                    <div key={p.param} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <code style={{ color: '#f1fa8c', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>{p.param}</code>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA bar */}
        <div style={{
          marginTop: 40, padding: '20px 24px',
          background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: 14 }}>Manage your creators &amp; campaigns</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
              Edit creator profiles, view uplift analytics, and generate install snippets at the VibeGuy console.
            </div>
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener"
            style={{
              background: '#38bdf8', color: '#0a0e1a',
              padding: '10px 22px', borderRadius: 6,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            Open VibeGuy Console ↗
          </a>
        </div>
      </div>
    </section>
  );
}
