'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SiteDnaPage() {
  const params = useParams();
  const siteId = params?.siteId as string;

  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState('');
  const [palette, setPalette] = useState<string[]>(['#0f172a', '#2563eb', '#ffffff']);
  const [fonts, setFonts] = useState<string[]>(['system-ui']);
  const [tone, setTone] = useState('');
  const [audience, setAudience] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const fetchDna = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}/dna`);
      if (res.ok) {
        const data = await res.json();
        const dna = data.dna;
        setBrandName(dna.brandName || '');
        setPalette(Array.isArray(dna.palette) ? dna.palette : ['#0f172a', '#2563eb', '#ffffff']);
        setFonts(Array.isArray(dna.fonts) ? dna.fonts : ['system-ui']);
        setTone(dna.tone || '');
        setAudience(dna.audience || '');
        setNotes(dna.notes || '');
      }
    } catch (e) {
      console.error('Failed to load DNA', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) fetchDna();
  }, [siteId]);

  const handleSaveDna = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/sites/${siteId}/dna`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          palette,
          fonts,
          tone,
          audience,
          notes,
        }),
      });

      if (res.ok) {
        setMessage({ text: 'Site DNA successfully saved.', type: 'ok' });
        setTimeout(() => setMessage(null), 4000);
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Failed to save DNA', type: 'err' });
      }
    } catch {
      setMessage({ text: 'Network error saving DNA', type: 'err' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToTheme = async () => {
    setApplying(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/sites/${siteId}/dna/apply-theme`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({
          text: `Generated "${data.theme.name}" in Theme Lab from Site DNA!`,
          type: 'ok',
        });
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Failed to generate theme from DNA', type: 'err' });
      }
    } catch {
      setMessage({ text: 'Network error generating theme', type: 'err' });
    } finally {
      setApplying(false);
    }
  };

  const handleColorChange = (index: number, val: string) => {
    const updated = [...palette];
    updated[index] = val;
    setPalette(updated);
  };

  const addColor = () => {
    setPalette([...palette, '#64748b']);
  };

  const removeColor = (index: number) => {
    if (palette.length <= 1) return;
    setPalette(palette.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="kicker">Site Workspace</p>
          <h1 style={{ marginBottom: 4 }}>Site DNA</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Establish the core brand identity, color theory, voice guidelines, and audience archetype.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn ghost"
            onClick={handleApplyToTheme}
            disabled={applying}
            id="apply-dna-to-theme-btn"
          >
            {applying ? 'Generating Theme...' : 'Apply DNA to Theme Lab'}
          </button>
          <button
            type="button"
            className="btn gold"
            onClick={handleSaveDna}
            disabled={saving}
            id="save-dna-btn"
          >
            {saving ? 'Saving...' : 'Save Site DNA'}
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: 12,
            borderRadius: 6,
            background: message.type === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: message.type === 'ok' ? 'var(--ok)' : 'var(--danger)',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{message.type === 'ok' ? '✓' : '✗'} {message.text}</span>
          {message.text.includes('Theme Lab') && (
            <Link href={`/sites/${siteId}/themes`} style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
              View in Theme Lab →
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading Site DNA...</p>
      ) : (
        <form onSubmit={handleSaveDna} className="space-y-6">
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Brand & Audience Foundation</h3>
            <div className="grid grid-2" style={{ gap: 16 }}>
              <div className="field">
                <label htmlFor="dna-brand-name">Brand Name</label>
                <input
                  id="dna-brand-name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Aurora Atelier"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="dna-audience">Primary Audience</label>
                <input
                  id="dna-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Minimalist design aficionados, hybrid conditioning athletes"
                />
              </div>
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <label htmlFor="dna-tone">Brand Voice & Tone</label>
              <input
                id="dna-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. Confident, restrained, architectural, tactile"
              />
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <label htmlFor="dna-notes">Brand Guidelines / Manifesto Notes</label>
              <textarea
                id="dna-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Strictly avoid loud gradients; favor unlacquered materials, raw stone, and deliberate negative space."
              />
            </div>
          </div>

          {/* Palette & Typography */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Color Palette & Typography</h3>
              <button
                type="button"
                className="btn ghost"
                style={{ fontSize: 12, padding: '3px 8px' }}
                onClick={addColor}
              >
                + Add Color
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              {palette.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                  }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                    style={{ width: 44, height: 36, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                    style={{ width: 80, fontSize: 11, textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                  />
                  {palette.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted)',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="field">
              <label htmlFor="dna-fonts">Core Typography Stack</label>
              <input
                id="dna-fonts"
                value={fonts.join(', ')}
                onChange={(e) => setFonts(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                placeholder="system-ui, -apple-system, sans-serif"
              />
              <small style={{ color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                Comma-separated fonts applied to headings and body copy in synthesized themes.
              </small>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
