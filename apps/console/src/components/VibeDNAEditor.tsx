'use client';

import { useState } from 'react';

interface Creator {
  id: string; name: string; handle: string; niche: string; tone: string; aesthetic: string;
  brandVoice: string; preferredCta: string; heroBanner: string; vibeCode: string;
  utmSource: string; utmCampaign: string; referrerRules: string; themeId: string;
}
interface Testimonial { id: string; creatorId: string; quote: string; author: string; image: string; approved: boolean; }

export function VibeDNAEditor({
  creators,
  testimonials,
}: {
  creators: Creator[];
  testimonials: Testimonial[];
}) {
  const [selected, setSelected] = useState(creators[0]?.id ?? '');
  const [edits, setEdits] = useState<Record<string, Partial<Creator>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [exported, setExported] = useState('');

  const creator = creators.find((c) => c.id === selected);
  const current = { ...creator, ...(edits[selected] ?? {}) } as Creator;
  const creatorTestimonials = testimonials.filter((t) => t.creatorId === selected);

  function update(key: keyof Creator, val: string) {
    setEdits((e) => ({ ...e, [selected]: { ...(e[selected] ?? {}), [key]: val } }));
  }

  async function save() {
    setSaving(true);
    await fetch('/api/creators', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected, ...edits[selected] }),
    });
    setSaving(false);
    setSaved('Saved!');
    setTimeout(() => setSaved(''), 2000);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibedna_${current.vibeCode}.json`;
    a.click();
    setExported('Exported!');
    setTimeout(() => setExported(''), 2000);
  }

  return (
    <div>
      {/* Creator tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {creators.map((c) => (
          <button
            key={c.id}
            className={`btn ${selected === c.id ? '' : 'ghost'}`}
            style={{ fontSize: 13 }}
            onClick={() => setSelected(c.id)}
          >
            {c.handle}
          </button>
        ))}
      </div>

      {creator && (
        <div className="grid grid-2" style={{ gap: 32 }}>
          {/* Edit form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>Display name</label>
              <input value={current.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="field">
              <label>Tone of voice</label>
              <input value={current.tone} onChange={(e) => update('tone', e.target.value)} />
            </div>
            <div className="field">
              <label>Aesthetic</label>
              <input value={current.aesthetic} onChange={(e) => update('aesthetic', e.target.value)} />
            </div>
            <div className="field">
              <label>Brand voice (short bio for AI seed)</label>
              <textarea
                rows={3}
                value={current.brandVoice}
                onChange={(e) => update('brandVoice', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="field">
              <label>Preferred CTA text</label>
              <input value={current.preferredCta} onChange={(e) => update('preferredCta', e.target.value)} />
            </div>
            <div className="field">
              <label>Hero banner URL</label>
              <input value={current.heroBanner} onChange={(e) => update('heroBanner', e.target.value)} />
            </div>
            <div className="row">
              <button className="btn gold" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              <button className="btn ghost" onClick={exportJson}>Export JSON</button>
              {saved && <span style={{ color: 'var(--ok)', fontSize: 13 }}>{saved}</span>}
              {exported && <span style={{ color: 'var(--ok)', fontSize: 13 }}>{exported}</span>}
            </div>
          </div>

          {/* Read-only profile card */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="kicker">Creator profile</p>
              {current.heroBanner && (
                <img src={current.heroBanner} alt="banner" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 2, marginBottom: 10 }} />
              )}
              <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-serif)' }}>{current.name}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {[
                  ['vibe', current.vibeCode],
                  ['utm', `${current.utmSource}/${current.utmCampaign}`],
                  ['theme', current.themeId],
                ].map(([k, v]) => (
                  <span key={k} className="pill" style={{ fontSize: 11 }}>{k}: {v}</span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                <strong>Niche:</strong> {current.niche}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                <strong>Tone:</strong> {current.tone}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                <strong>Referrer rules:</strong>{' '}
                {JSON.parse(current.referrerRules || '[]').join(', ')}
              </div>
            </div>

            {/* Testimonials */}
            <p className="kicker" style={{ marginBottom: 10 }}>Approved testimonials</p>
            {creatorTestimonials.map((t) => (
              <div key={t.id} className="card" style={{ marginBottom: 8, padding: '12px 14px', display: 'flex', gap: 12 }}>
                <img src={t.image} alt={t.author} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 13, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>— {t.author}</p>
                </div>
              </div>
            ))}

            {/* JSON export preview */}
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                View raw JSON
              </summary>
              <pre className="code" style={{ fontSize: 10, marginTop: 8 }}>
                {JSON.stringify(current, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
