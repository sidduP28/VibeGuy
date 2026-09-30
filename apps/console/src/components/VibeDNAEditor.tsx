'use client';

import { useState } from 'react';

interface Creator {
  id: string; name: string; handle: string; niche: string; tone: string; aesthetic: string;
  brandVoice: string; preferredCta: string; heroBanner: string; vibeCode: string;
  utmSource: string; utmCampaign: string; referrerRules: string; themeId: string;
}
interface Testimonial { id: string; creatorId: string; quote: string; author: string; image: string; approved: boolean; }

const STORE_HOST = 'http://localhost:3002';

// Theme accent colours — keeps cards visually distinct
const THEME_ACCENTS: Record<string, string> = {
  'fitness-energy': '#22c55e',
  'minimalist':     '#64748b',
  'luxury':         '#f59e0b',
  'default':        '#38bdf8',
};

function accent(themeId: string) {
  return THEME_ACCENTS[themeId] ?? THEME_ACCENTS.default;
}

function CopyBtn({ text, label = 'copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1600); })}
      style={{
        background: done ? 'rgba(34,197,94,0.12)' : 'var(--paper)',
        border: `1px solid ${done ? 'rgba(34,197,94,0.4)' : 'var(--rule)'}`,
        color: done ? 'var(--ok)' : 'var(--muted)',
        padding: '2px 9px', borderRadius: 4, fontSize: 11,
        cursor: 'pointer', fontFamily: 'var(--font-mono)',
        transition: 'all 0.18s', whiteSpace: 'nowrap',
      }}
    >
      {done ? '✓ copied' : label}
    </button>
  );
}

function VibeLinksPanel({ creator }: { creator: Creator }) {
  const ac = accent(creator.themeId);
  const vibeUrl  = `${STORE_HOST}/?vibe=${creator.vibeCode}`;
  const refUrl   = `${STORE_HOST}/?ref=${creator.vibeCode}`;
  const utmUrl   = `${STORE_HOST}/?utm_source=${creator.utmSource}&utm_campaign=${creator.utmCampaign}`;
  const contentUrl = `${STORE_HOST}/?utm_content=${creator.vibeCode}`;

  const links = [
    { label: 'Vibe link',      param: `?vibe=${creator.vibeCode}`,    url: vibeUrl,    desc: 'Primary — share in bio / DMs' },
    { label: 'Ref link',       param: `?ref=${creator.vibeCode}`,     url: refUrl,     desc: 'Affiliate / referral tracking' },
    { label: 'UTM link',       param: `?utm_source=${creator.utmSource}&utm_campaign=${creator.utmCampaign}`, url: utmUrl, desc: 'Instagram / YouTube campaign posts' },
    { label: 'UTM content',    param: `?utm_content=${creator.vibeCode}`, url: contentUrl, desc: 'Fallback utm_content param' },
  ];

  const referrerRules: string[] = JSON.parse(creator.referrerRules || '[]');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Creator identity bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: `${ac}10`, border: `1px solid ${ac}30`, borderRadius: 6,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: ac, color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15, flexShrink: 0,
        }}>
          {creator.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{creator.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {creator.handle} · vibeCode: <span style={{ color: ac }}>{creator.vibeCode}</span>
          </div>
        </div>
        <a
          href={vibeUrl}
          target="_blank"
          rel="noopener"
          style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 600,
            color: ac, background: `${ac}15`,
            border: `1px solid ${ac}30`,
            padding: '4px 10px', borderRadius: 4, textDecoration: 'none',
          }}
        >
          Preview store ↗
        </a>
      </div>

      {/* Link rows */}
      {links.map((l) => (
        <div key={l.label} style={{
          background: 'var(--paper)', border: '1px solid var(--rule)',
          borderRadius: 6, padding: '10px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>
              {l.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l.desc}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--ink)', flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {STORE_HOST}/<span style={{ color: ac }}>{l.param}</span>
            </code>
            <CopyBtn text={l.url} />
          </div>
        </div>
      ))}

      {/* Referrer rules */}
      {referrerRules.length > 0 && (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 6, padding: '10px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>
            Auto-detect referrers
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {referrerRules.map((r) => (
              <span key={r} className="pill" style={{ fontSize: 11, color: ac }}>{r}</span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
            Visitors arriving from these domains will automatically see {creator.name}'s personalised store — no ?vibe= param needed.
          </p>
        </div>
      )}

      {/* URL anatomy */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 6, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>
          URL anatomy
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', lineHeight: 2, fontSize: 12 }}>
          <span style={{ color: 'var(--muted)' }}>{STORE_HOST}/</span>
          <span style={{ color: '#f59e0b' }}>?vibe=</span>
          <span style={{ color: ac }}>{creator.vibeCode}</span>
          <span style={{ color: 'var(--muted)', margin: '0 8px' }}>·</span>
          <span style={{ color: '#f59e0b' }}>?ref=</span>
          <span style={{ color: ac }}>{creator.vibeCode}</span>
          <span style={{ color: 'var(--muted)', margin: '0 8px' }}>·</span>
          <span style={{ color: '#f59e0b' }}>?utm_content=</span>
          <span style={{ color: ac }}>{creator.vibeCode}</span>
        </div>
      </div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<'edit' | 'links' | 'preview'>('edit');

  const creator = creators.find((c) => c.id === selected);
  const current = { ...creator, ...(edits[selected] ?? {}) } as Creator;
  const creatorTestimonials = testimonials.filter((t) => t.creatorId === selected);
  const ac = accent(current.themeId);

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
    setSaved('Saved — live at :3002');
    setTimeout(() => setSaved(''), 2400);
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
      {/* Creator selector tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {creators.map((c) => {
          const cAc = accent(c.themeId);
          const isActive = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => { setSelected(c.id); setActiveTab('edit'); }}
              style={{
                background: isActive ? `${cAc}15` : 'var(--paper)',
                border: `1px solid ${isActive ? cAc : 'var(--rule)'}`,
                color: isActive ? cAc : 'var(--muted)',
                padding: '6px 14px', borderRadius: 6, fontSize: 12,
                cursor: 'pointer', fontWeight: isActive ? 700 : 400,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isActive ? cAc : 'var(--muted)', display: 'inline-block',
              }} />
              {c.handle}
            </button>
          );
        })}
      </div>

      {creator && (
        <div>
          {/* Section tabs: Edit | Vibe Links | Preview */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--rule)' }}>
            {(['edit', 'links', 'preview'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 18px 10px',
                  borderBottom: activeTab === tab ? `2px solid ${ac}` : '2px solid transparent',
                  color: activeTab === tab ? ac : 'var(--muted)',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {tab === 'edit' ? '✏ Edit Profile' : tab === 'links' ? '🔗 Vibe Links' : '👁 Preview JSON'}
              </button>
            ))}
            {saved && (
              <span style={{ marginLeft: 'auto', alignSelf: 'center', color: 'var(--ok)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                ✓ {saved}
              </span>
            )}
          </div>

          {/* ── TAB: Edit Profile ── */}
          {activeTab === 'edit' && (
            <div className="grid grid-2" style={{ gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="field">
                  <label>Display name</label>
                  <input value={current.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="field">
                  <label>Handle</label>
                  <input value={current.handle} onChange={(e) => update('handle', e.target.value)} />
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
                  <label>Brand voice</label>
                  <textarea rows={3} value={current.brandVoice} onChange={(e) => update('brandVoice', e.target.value)} style={{ resize: 'vertical' }} />
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
                  {exported && <span style={{ color: 'var(--ok)', fontSize: 13 }}>{exported}</span>}
                </div>
              </div>

              {/* Profile card */}
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
                      <span key={k} className="pill" style={{ fontSize: 11, color: ac }}>{k}: {v}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                    <strong>Niche:</strong> {current.niche}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    <strong>Tone:</strong> {current.tone}
                  </div>
                </div>

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
              </div>
            </div>
          )}

          {/* ── TAB: Vibe Links ── */}
          {activeTab === 'links' && (
            <div>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
                Share these URLs with <strong style={{ color: 'var(--ink)' }}>{current.name}</strong>.
                When a visitor arrives via these links, Aurora Store reskins itself — copy, hero,
                colors, offer, and testimonial — all in &lt;50ms.
              </p>
              <div className="grid grid-2" style={{ gap: 24, alignItems: 'start' }}>
                <VibeLinksPanel creator={current} />

                {/* All creators quick-reference */}
                <div>
                  <p className="kicker" style={{ marginBottom: 12 }}>All creator links</p>
                  {creators.map((c) => {
                    const cAc = accent(c.themeId);
                    return (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', marginBottom: 8,
                        background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 6,
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: cAc, color: '#000',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 12, flexShrink: 0,
                        }}>
                          {c.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                          <code style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                            ?vibe=<span style={{ color: cAc }}>{c.vibeCode}</span>
                          </code>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <CopyBtn text={`${STORE_HOST}/?vibe=${c.vibeCode}`} />
                          <a
                            href={`${STORE_HOST}/?vibe=${c.vibeCode}`}
                            target="_blank"
                            rel="noopener"
                            style={{
                              fontSize: 11, color: cAc, fontWeight: 600,
                              background: `${cAc}12`, border: `1px solid ${cAc}30`,
                              padding: '2px 9px', borderRadius: 4, textDecoration: 'none',
                            }}
                          >
                            ↗
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Preview JSON ── */}
          {activeTab === 'preview' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button className="btn gold" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                <button className="btn ghost" onClick={exportJson}>Download JSON</button>
              </div>
              <pre className="code" style={{ fontSize: 11, maxHeight: 520, overflow: 'auto' }}>
                {JSON.stringify(current, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
