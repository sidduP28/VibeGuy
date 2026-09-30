'use client';

import { useState, useTransition } from 'react';
import { updateCreator } from '@/lib/creator-actions';

interface Creator {
  id: string;
  name: string;
  handle: string;
  niche: string;
  audience: string;
  tone: string;
  aesthetic: string;
  themeId: string;
  vibeCode: string;
  preferredCta: string;
  brandVoice: string;
  heroBanner: string;
}

interface Testimonial {
  id: string;
  creatorId: string;
  quote: string;
  author: string;
  image: string;
  approved: boolean;
}

interface Props {
  creator: Creator;
  testimonials: Testimonial[];
}

export function CreatorEditForm({ creator, testimonials }: Props) {
  const [form, setForm] = useState({
    name: creator.name,
    handle: creator.handle,
    niche: creator.niche,
    audience: creator.audience,
    tone: creator.tone,
    aesthetic: creator.aesthetic,
    preferredCta: creator.preferredCta,
    brandVoice: creator.brandVoice,
    heroBanner: creator.heroBanner,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (key: string, value: string) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateCreator(creator.id, form);
        setSaved(true);
        setError('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Update failed');
      }
    });
  };

  // Determine theme color hint from niche
  const themeAccent =
    creator.niche.toLowerCase().includes('fitness') ? '#22c55e'
    : creator.niche.toLowerCase().includes('luxury') ? '#f59e0b'
    : creator.niche.toLowerCase().includes('minimalist') || creator.niche.toLowerCase().includes('productivity') ? '#64748b'
    : '#38bdf8';

  return (
    <div className="card" style={{ borderTop: `3px solid ${themeAccent}`, position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: themeAccent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#000',
            }}>
              {creator.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{form.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{form.handle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="pill" style={{ color: themeAccent }}>vibeCode: {creator.vibeCode}</span>
            <span className="pill">{creator.themeId}</span>
            <a
              href={`http://localhost:3002?vibe=${creator.vibeCode}`}
              target="_blank"
              rel="noopener"
              className="pill"
              style={{ color: themeAccent, textDecoration: 'none', cursor: 'pointer' }}
            >
              Preview store ↗
            </a>
          </div>
        </div>
        {saved && (
          <span style={{ color: 'var(--ok)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            ✓ Saved — live at :3002
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-3" style={{ gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>DISPLAY NAME</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>HANDLE</label>
            <input
              type="text"
              value={form.handle}
              onChange={(e) => handleChange('handle', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>NICHE</label>
            <input
              type="text"
              value={form.niche}
              onChange={(e) => handleChange('niche', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-3" style={{ gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>AUDIENCE</label>
            <input
              type="text"
              value={form.audience}
              onChange={(e) => handleChange('audience', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>TONE</label>
            <input
              type="text"
              value={form.tone}
              onChange={(e) => handleChange('tone', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>PREFERRED CTA</label>
            <input
              type="text"
              value={form.preferredCta}
              onChange={(e) => handleChange('preferredCta', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>AESTHETIC DESCRIPTION</label>
          <input
            type="text"
            value={form.aesthetic}
            onChange={(e) => handleChange('aesthetic', e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>BRAND VOICE</label>
          <textarea
            value={form.brandVoice}
            onChange={(e) => handleChange('brandVoice', e.target.value)}
            rows={2}
            style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>HERO BANNER URL</label>
          <input
            type="text"
            value={form.heroBanner}
            onChange={(e) => handleChange('heroBanner', e.target.value)}
            style={{ ...inputStyle, width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
        </div>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="kicker" style={{ marginBottom: 8 }}>Testimonials ({testimonials.length})</p>
            {testimonials.map((t) => (
              <div key={t.id} style={{
                padding: '10px 14px', marginBottom: 8,
                background: 'var(--paper)', borderRadius: 4,
                borderLeft: `3px solid ${themeAccent}`,
              }}>
                <p style={{ fontSize: 13, fontStyle: 'italic', margin: '0 0 4px' }}>"{t.quote}"</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>— {t.author}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isPending}
            className="btn gold"
            style={{ minWidth: 140 }}
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <a
            href={`http://localhost:3002?vibe=${creator.vibeCode}`}
            target="_blank"
            rel="noopener"
            className="btn ghost"
          >
            Preview in store ↗
          </a>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--paper)',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  color: 'var(--ink)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};
