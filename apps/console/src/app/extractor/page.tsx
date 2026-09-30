'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VibeResult {
  url: string;
  palette: string[];
  fonts: string[];
  ctaStyle: { radius: string };
  copyTone: string;
  theme?: {
    id: string;
    siteId: string;
    name: string;
    tokens: any;
  };
}

interface SiteOption {
  id: string;
  name: string;
}

export default function ExtractorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VibeResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<VibeResult[]>([]);
  
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site_aurora');
  const [addingTheme, setAddingTheme] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sites')
      .then((res) => res.json())
      .then((data) => {
        if (data.sites && Array.isArray(data.sites)) {
          setSites(data.sites);
          if (data.sites.length > 0) {
            setSelectedSiteId(data.sites[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  async function extract() {
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAddedSuccess(null);
    try {
      const res = await fetch('/api/extract/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, siteId: selectedSiteId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(`Error: ${data.error} (SSRF guard may have blocked a private/internal URL)`);
      } else {
        setResult(data);
        setHistory((h) => [data, ...h.slice(0, 4)]);
      }
    } catch {
      setError('Network error during extraction');
    }
    setLoading(false);
  }

  async function addToThemeLab() {
    if (!result) return;
    setAddingTheme(true);
    setAddedSuccess(null);
    try {
      let host = 'Brand';
      try {
        const full = /^https?:\/\//i.test(result.url) ? result.url : `https://${result.url}`;
        host = new URL(full).hostname.replace(/^www\./, '').split('.')[0];
        host = host.charAt(0).toUpperCase() + host.slice(1);
      } catch {}

      const themeName = `${host} Aesthetic`;
      const bg = result.palette[2] || (result.palette[0]?.startsWith('#f') ? result.palette[0] : '#ffffff');
      const fg = result.palette[0] && !result.palette[0].startsWith('#f') ? result.palette[0] : '#0f172a';
      const accent = result.palette[1] || '#2563eb';
      const fontHeading = result.fonts[0] || 'system-ui, sans-serif';
      const fontBody = result.fonts[1] || result.fonts[0] || 'system-ui, sans-serif';

      const tokens = {
        bg,
        fg,
        accent,
        cardBg: bg === '#ffffff' ? '#f8fafc' : bg,
        border: fg === '#ffffff' ? '#334155' : '#e2e8f0',
        muted: '#64748b',
        fontHeading,
        fontBody,
        radius: result.ctaStyle?.radius || '6px',
        space: '16px',
        copyDefaults: {
          headline: `Engineered by ${themeName}`,
          subheadline: result.copyTone,
          ctaText: 'Explore Collection',
        },
      };

      const res = await fetch(`/api/sites/${selectedSiteId}/themes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: themeName,
          tokens,
        }),
      });

      if (res.ok) {
        setAddedSuccess(themeName);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Failed to add theme to Theme Lab');
      }
    } catch {
      setError('Network error saving theme');
    }
    setAddingTheme(false);
  }

  return (
    <div>
      <p className="kicker">Reference Extractor</p>
      <h1>Vibe Extractor</h1>
      <p className="lede">
        Paste any public website URL to extract its color palette, typography hierarchy, CTA geometry, and brand tone.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && extract()}
          placeholder="https://apple.com, stripe.com, or any public brand URL"
          style={{ flex: 1, minWidth: 280 }}
        />
        <button className="btn gold" onClick={extract} disabled={loading}>
          {loading ? 'Extracting…' : 'Extract vibe'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(155,44,44,0.1)', border: '1px solid var(--danger)', borderRadius: 2, marginBottom: 16, fontSize: 13, color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {addedSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid var(--ok)', borderRadius: 4, marginBottom: 20, fontSize: 13, color: 'var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span>
            <strong>✓ Added &quot;{addedSuccess}&quot; to Theme Lab!</strong>
          </span>
          <Link href={`/sites/${selectedSiteId}/themes`} className="btn ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
            Open in Theme Lab &rarr;
          </Link>
        </div>
      )}

      {result && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="row" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p className="kicker" style={{ margin: 0 }}>Extracted: {result.url}</p>
              <span className="pill" style={{ fontSize: 11, marginTop: 4, display: 'inline-block' }}>{result.copyTone}</span>
            </div>
            
            {/* Store Target & Add Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {sites.length > 0 && (
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  style={{ fontSize: 12, padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)' }}
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="btn gold"
                onClick={addToThemeLab}
                disabled={addingTheme}
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>{addingTheme ? 'Adding...' : '+ Add to Theme Lab'}</span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>COLOR PALETTE</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {result.palette.map((col, i) => (
                <div key={i} title={col} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 44, height: 44, background: col, borderRadius: 4, border: '1px solid var(--rule)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{col}</span>
                </div>
              ))}
              {result.palette.length === 0 && (
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>No colors detected in inline CSS</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>FONTS</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {result.fonts.map((f, i) => (
                <span key={i} className="pill" style={{ fontSize: 12 }}>{f}</span>
              ))}
              {result.fonts.length === 0 && (
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>No font-family declarations found</span>
              )}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CTA GEOMETRY</p>
            <span className="pill">border-radius: {result.ctaStyle?.radius || result.theme?.tokens?.radius || '6px'}</span>
          </div>
        </div>
      )}

      {history.length > 1 && (
        <>
          <p className="kicker" style={{ marginBottom: 10 }}>Recent extractions</p>
          <div className="grid" style={{ gap: 8 }}>
            {history.slice(1).map((r, i) => (
              <div key={i} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(r.palette || []).slice(0, 5).map((col, j) => (
                    <div key={j} style={{ width: 20, height: 20, background: col, borderRadius: 2, border: '1px solid var(--rule)' }} />
                  ))}
                </div>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }}>{r.url}</div>
                <span className="pill" style={{ fontSize: 10 }}>{r.copyTone}</span>
                <button className="btn ghost" style={{ fontSize: 11 }} onClick={() => { setResult(r); setUrl(r.url); }}>
                  Load
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
