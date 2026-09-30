'use client';

import { useState, useEffect } from 'react';
import { BUILTIN_THEMES } from '@vibe/core';

interface Creator { id: string; name: string; handle: string; vibeCode: string; utmSource: string; utmCampaign: string; themeId: string; }
interface Campaign { id: string; name: string; creatorId: string; themeId: string; headline: string; subheadline: string; cta: string; hero: string; offer: string; promoCode: string; productUrl: string; productTitle: string; productPrice: string; holdoutPct: number; status: string; }

function QRSvg({ value }: { value: string }) {
  // Simple visual placeholder QR for demo; real QR requires a lib
  return (
    <svg width="80" height="80" viewBox="0 0 8 8" shapeRendering="crispEdges" style={{ border: '1px solid var(--rule)' }}>
      <rect width="8" height="8" fill="white"/>
      {/* Corner squares */}
      <rect x="0" y="0" width="3" height="3" fill="black"/><rect x="1" y="1" width="1" height="1" fill="white"/>
      <rect x="5" y="0" width="3" height="3" fill="black"/><rect x="6" y="1" width="1" height="1" fill="white"/>
      <rect x="0" y="5" width="3" height="3" fill="black"/><rect x="1" y="6" width="1" height="1" fill="white"/>
      <text x="4" y="6.5" fontSize="1.5" fill="var(--ink)" textAnchor="middle" style={{ fontSize: '1.2px' }}>QR</text>
    </svg>
  );
}

export function CampaignBuilder({ creators, initial }: { creators: Creator[]; initial?: Campaign }) {
  const themes = Object.entries(BUILTIN_THEMES);

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    creatorId: initial?.creatorId ?? creators[0]?.id ?? '',
    themeId: initial?.themeId ?? 'fitness-energy',
    headline: initial?.headline ?? '',
    subheadline: initial?.subheadline ?? '',
    cta: initial?.cta ?? '',
    hero: initial?.hero ?? '',
    offer: initial?.offer ?? '',
    promoCode: initial?.promoCode ?? '',
    productUrl: initial?.productUrl ?? '',
    productTitle: initial?.productTitle ?? '',
    productPrice: initial?.productPrice ?? '',
    holdoutPct: initial?.holdoutPct ?? 10,
    status: initial?.status ?? 'active',
    testimonialIds: [] as string[],
    siteId: 'site_demo',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [tab, setTab] = useState<'desktop' | 'mobile'>('desktop');
  const [copyLabel, setCopyLabel] = useState('Copy link');
  const [vibeLink, setVibeLink] = useState('');

  const creator = creators.find((c) => c.id === form.creatorId);
  const theme = BUILTIN_THEMES[form.themeId];

  useEffect(() => {
    if (creator) {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      setVibeLink(`${base}?vibe=${creator.vibeCode}`);
    }
  }, [form.creatorId, creator]);

  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function extractProduct() {
    if (!form.productUrl) return;
    setExtracting(true);
    try {
      const res = await fetch('/api/extract/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.productUrl }),
      });
      const data = await res.json();
      if (data.title) set('productTitle', data.title);
      if (data.image && !form.hero) set('hero', data.image);
    } catch {}
    setExtracting(false);
  }

  async function handleSave() {
    setSaving(true);
    const method = initial?.id ? 'PATCH' : 'POST';
    const body = initial?.id ? { id: initial.id, ...form } : form;
    const res = await fetch('/api/campaigns', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaved(data.id ? `Saved! ID: ${data.id}` : data.ok ? 'Saved!' : 'Error saving');
    setSaving(false);
    setTimeout(() => setSaved(''), 3000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(vibeLink);
    setCopyLabel('Copied!');
    setTimeout(() => setCopyLabel('Copy link'), 2000);
  }

  const personalizedStyle = {
    '--vibe-bg': theme?.backgroundColor ?? '#050505',
    '--vibe-text': theme?.textColor ?? '#f4f4f5',
    '--vibe-primary': theme?.primaryColor ?? '#fff',
  } as React.CSSProperties;

  return (
    <div>
      <div className="grid grid-2" style={{ gap: 32 }}>
        {/* LEFT: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label>Campaign name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Alex Rivera Spring Surge" />
          </div>

          <div className="field">
            <label>Creator</label>
            <select value={form.creatorId} onChange={(e) => {
              const c = creators.find(x => x.id === e.target.value);
              set('creatorId', e.target.value);
              if (c) set('themeId', c.themeId);
            }}>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.handle})</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Product URL <span style={{ color: 'var(--muted)', fontSize: 11 }}>(SSRF-safe fetch)</span></label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={form.productUrl}
                onChange={(e) => set('productUrl', e.target.value)}
                placeholder="https://store.example.com/products/..."
                style={{ flex: 1 }}
              />
              <button className="btn ghost" type="button" onClick={extractProduct} disabled={extracting} style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                {extracting ? 'Fetching…' : 'Auto-fill ↓'}
              </button>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 10 }}>
            <div className="field">
              <label>Product title</label>
              <input value={form.productTitle} onChange={(e) => set('productTitle', e.target.value)} />
            </div>
            <div className="field">
              <label>Price</label>
              <input value={form.productPrice} onChange={(e) => set('productPrice', e.target.value)} placeholder="$48.00" />
            </div>
          </div>

          <div className="field">
            <label>Headline <span style={{ color: 'var(--muted)', fontSize: 11 }}>slot: headline</span></label>
            <input value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Fuel Like Alex Rivera: Peak Athletic Performance" />
          </div>

          <div className="field">
            <label>Subheadline <span style={{ color: 'var(--muted)', fontSize: 11 }}>slot: subheadline</span></label>
            <input value={form.subheadline} onChange={(e) => set('subheadline', e.target.value)} />
          </div>

          <div className="field">
            <label>Hero image URL <span style={{ color: 'var(--muted)', fontSize: 11 }}>slot: hero-image</span></label>
            <input value={form.hero} onChange={(e) => set('hero', e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>

          <div className="grid grid-2" style={{ gap: 10 }}>
            <div className="field">
              <label>CTA text <span style={{ color: 'var(--muted)', fontSize: 11 }}>slot: cta</span></label>
              <input value={form.cta} onChange={(e) => set('cta', e.target.value)} />
            </div>
            <div className="field">
              <label>Promo code</label>
              <input value={form.promoCode} onChange={(e) => set('promoCode', e.target.value)} placeholder="ALEX20" />
            </div>
          </div>

          <div className="field">
            <label>Offer text <span style={{ color: 'var(--muted)', fontSize: 11 }}>slot: offer</span></label>
            <input value={form.offer} onChange={(e) => set('offer', e.target.value)} placeholder="20% OFF Creator Exclusive Bundle + Free Shaker" />
          </div>

          <div className="field">
            <label>Theme</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 4 }}>
              {themes.map(([id, t]) => (
                <button
                  key={id}
                  type="button"
                  title={t.name}
                  onClick={() => set('themeId', id)}
                  style={{
                    height: 36,
                    background: t.backgroundColor,
                    border: form.themeId === id ? `2px solid ${t.primaryColor}` : '2px solid transparent',
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: t.textColor,
                    fontFamily: 'var(--font-mono)',
                    overflow: 'hidden',
                  }}
                >
                  {t.name.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Holdout % <span style={{ color: 'var(--muted)', fontSize: 11 }}>(control group size: {form.holdoutPct}%)</span></label>
            <input
              type="range" min={0} max={50} step={5}
              value={form.holdoutPct}
              onChange={(e) => set('holdoutPct', Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn gold" type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save campaign'}
            </button>
            {saved && <span style={{ fontSize: 13, color: 'var(--ok)' }}>{saved}</span>}
          </div>

          {/* Vibe Link Generator */}
          <div className="card" style={{ marginTop: 8 }}>
            <p className="kicker">Vibe link generator</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <input
                readOnly
                value={vibeLink}
                style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-mono)', background: '#111', color: '#efe7d6', border: 'none', padding: '6px 8px', borderRadius: 2 }}
              />
              <button className="btn" type="button" onClick={copyLink} style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                {copyLabel}
              </button>
              <QRSvg value={vibeLink} />
            </div>
            <div className="row" style={{ marginTop: 8, gap: 6 }}>
              <a href={`${vibeLink}&utm_source=${creator?.utmSource}`} target="_blank" className="btn ghost" style={{ fontSize: 11 }}>Open in demo store ↗</a>
              <code style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                utm_source={creator?.utmSource}
              </code>
            </div>
          </div>
        </div>

        {/* RIGHT: Split Preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <p className="kicker">Live split preview</p>
          <div className="tabs">
            <button className={`btn ${tab === 'desktop' ? '' : 'ghost'}`} style={{ fontSize: 12 }} onClick={() => setTab('desktop')}>Desktop</button>
            <button className={`btn ${tab === 'mobile' ? '' : 'ghost'}`} style={{ fontSize: 12 }} onClick={() => setTab('mobile')}>Mobile</button>
          </div>
          <div className="split" style={{ maxWidth: tab === 'mobile' ? 400 : 'none' }}>
            {/* Generic */}
            <div className="pane generic">
              <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#888', marginBottom: 8 }}>GENERIC (control group)</p>
              {form.hero && (
                <div className="hero-box" style={{ marginBottom: 8 }}>
                  <img src={form.hero} alt="hero" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: '0 0 6px' }}>
                [Your brand headline here]
              </h2>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>Generic subheadline for all visitors.</p>
              <button className="btn" style={{ fontSize: 13 }}>Shop Now</button>
              <div style={{ marginTop: 10, fontSize: 11, color: '#aaa', fontFamily: 'var(--font-mono)' }}>
                execMs: — · CLS: 0.000
              </div>
            </div>
            {/* Personalized */}
            <div className="pane personalized" style={personalizedStyle}>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: theme?.primaryColor ?? '#ccc', marginBottom: 8 }}>
                PERSONALIZED ({creator?.handle})
              </p>
              {form.hero && (
                <div className="hero-box" style={{ marginBottom: 8 }}>
                  <img src={form.hero} alt="hero" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <h2 data-vibe-slot="headline" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: '0 0 6px', color: theme?.textColor ?? '#f4f4f5' }}>
                {form.headline || '[headline slot]'}
              </h2>
              <p data-vibe-slot="subheadline" style={{ fontSize: 13, color: theme?.accentColor ?? '#888', margin: '0 0 10px' }}>
                {form.subheadline || '[subheadline slot]'}
              </p>
              {form.offer && (
                <div data-vibe-slot="offer" style={{ background: theme?.primaryColor, color: theme?.backgroundColor, padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 8, borderRadius: 2 }}>
                  {form.offer}
                </div>
              )}
              <button data-vibe-slot="cta" className="btn" style={{ fontSize: 13, background: theme?.primaryColor, color: theme?.backgroundColor, borderRadius: theme?.borderRadius }}>
                {form.cta || '[cta slot]'}
              </button>
              <div style={{ marginTop: 10, fontSize: 11, color: theme?.accentColor ?? '#aaa', fontFamily: 'var(--font-mono)' }}>
                execMs: ~12ms · CLS: 0.000
              </div>
            </div>
          </div>
          {/* SDK snippet preview */}
          <div style={{ marginTop: 12 }}>
            <p className="kicker" style={{ marginBottom: 6 }}>Install snippet</p>
            <pre className="code" style={{ fontSize: 11 }}>{`<script src="/api/sdk/site_demo"></script>`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
