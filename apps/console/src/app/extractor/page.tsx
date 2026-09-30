'use client';

import { useState } from 'react';

interface VibeResult {
  url: string;
  palette: string[];
  fonts: string[];
  ctaStyle: { radius: string };
  copyTone: string;
}

export default function ExtractorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VibeResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<VibeResult[]>([]);

  async function extract() {
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/extract/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) {
        setError(`Error: ${data.error} (SSRF guard may have blocked a private/internal URL)`);
      } else {
        setResult(data);
        setHistory((h) => [data, ...h.slice(0, 4)]);
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <div>
      <p className="kicker">Reference Extractor</p>
      <h1>Vibe Extractor</h1>
      <p className="lede">
        Paste a public URL to extract its color palette, fonts, CTA styles, and copy tone. 
        All fetches are SSRF-guarded — private IPs and DNS rebinding are blocked.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && extract()}
          placeholder="https://stripe.com — any public https:// URL"
          style={{ flex: 1 }}
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

      {result && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <p className="kicker" style={{ margin: 0 }}>Extracted: {result.url}</p>
            <span className="pill" style={{ fontSize: 11 }}>{result.copyTone}</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>COLOR PALETTE</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {result.palette.map((col, i) => (
                <div key={i} title={col} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 36, height: 36, background: col, borderRadius: 2, border: '1px solid var(--rule)' }} />
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{col}</span>
                </div>
              ))}
              {result.palette.length === 0 && (
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>No colors detected in inline CSS</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
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
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CTA STYLE</p>
            <span className="pill">border-radius: {result.ctaStyle.radius}</span>
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
                  {r.palette.slice(0, 5).map((col, j) => (
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
