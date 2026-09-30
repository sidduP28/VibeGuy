'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { calculateContrastRatio } from '@vibe/core';

interface ThemeItem {
  id: string;
  siteId: string;
  name: string;
  tokens: {
    bg?: string;
    fg?: string;
    accent?: string;
    cardBg?: string;
    border?: string;
    muted?: string;
    fontHeading?: string;
    fontBody?: string;
    radius?: string;
    space?: string;
  };
  isBuiltin: boolean;
  isDefault: boolean;
  createdAt: string;
}

export default function SiteThemesPage() {
  const params = useParams();
  const siteId = params?.siteId as string;

  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [defaultThemeId, setDefaultThemeId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal state
  const [editingTheme, setEditingTheme] = useState<ThemeItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTokens, setNewTokens] = useState<any>({
    bg: '#ffffff',
    fg: '#0f172a',
    accent: '#2563eb',
    cardBg: '#f8fafc',
    border: '#e2e8f0',
    muted: '#64748b',
    fontHeading: 'system-ui, -apple-system, sans-serif',
    fontBody: 'system-ui, -apple-system, sans-serif',
    radius: '8px',
    space: '16px',
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchThemes = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}/themes`);
      if (res.ok) {
        const data = await res.json();
        setThemes(data.themes || []);
        setDefaultThemeId(data.defaultThemeId || '');
      }
    } catch (e) {
      console.error('Failed to load themes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) fetchThemes();
  }, [siteId]);

  const handleSetDefault = async (themeId: string, themeName: string) => {
    setErrorMessage('');
    try {
      const res = await fetch(`/api/sites/${siteId}/themes/${themeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-default' }),
      });
      if (res.ok) {
        setSuccessMessage(`"${themeName}" is now the default site theme for all non-personalized visitors.`);
        setTimeout(() => setSuccessMessage(''), 4000);
        fetchThemes();
      } else {
        const err = await res.json();
        setErrorMessage(err.message || err.error || 'Failed to set default theme');
      }
    } catch {
      setErrorMessage('Error setting default theme');
    }
  };

  const handleDuplicate = async (themeId: string) => {
    setErrorMessage('');
    try {
      const res = await fetch(`/api/sites/${siteId}/themes/${themeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      });
      if (res.ok) {
        fetchThemes();
      } else {
        const err = await res.json();
        setErrorMessage(err.message || 'Failed to duplicate theme');
      }
    } catch {
      setErrorMessage('Error duplicating theme');
    }
  };

  const handleDelete = async (themeId: string, themeName: string) => {
    if (!confirm(`Are you sure you want to delete "${themeName}"?`)) return;
    setErrorMessage('');

    try {
      const res = await fetch(`/api/sites/${siteId}/themes/${themeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchThemes();
      } else {
        const err = await res.json();
        setErrorMessage(err.message || err.error || 'Cannot delete theme in use');
      }
    } catch {
      setErrorMessage('Network error attempting to delete theme');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheme) return;
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/sites/${siteId}/themes/${editingTheme.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTheme.name,
          tokens: editingTheme.tokens,
        }),
      });

      if (res.ok) {
        setEditingTheme(null);
        fetchThemes();
      } else {
        const err = await res.json();
        setErrorMessage(err.message || 'Failed to update theme');
      }
    } catch {
      setErrorMessage('Error saving theme changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/sites/${siteId}/themes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          tokens: newTokens,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewName('');
        fetchThemes();
      } else {
        const err = await res.json();
        setErrorMessage(err.message || 'Failed to create theme');
      }
    } catch {
      setErrorMessage('Error creating theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="kicker">Site Workspace</p>
          <h1 style={{ marginBottom: 4 }}>Theme Lab</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Curate design tokens for this storefront. Single source of truth for creator skins and site-wide branding.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href={`/extractor?siteId=${siteId}`}
            className="btn ghost"
            id="extract-vibe-link"
          >
            ✦ Extract with AI
          </Link>
          <button
            className="btn gold"
            onClick={() => {
              setShowAddModal(true);
              setErrorMessage('');
            }}
            id="add-theme-btn"
          >
            + New Theme
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={{ padding: 12, borderRadius: 6, background: 'rgba(34,197,94,0.15)', color: 'var(--ok)', fontSize: 13 }}>
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: 12, borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', fontSize: 13 }}>
          ✗ {errorMessage}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading themes...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {themes.map((theme) => {
            const isDefault = theme.id === defaultThemeId || theme.isDefault;
            const t = theme.tokens || {};
            const bg = t.bg || '#ffffff';
            const fg = t.fg || '#0f172a';
            const accent = t.accent || '#2563eb';
            const cardBg = t.cardBg || (bg === '#ffffff' ? '#f8fafc' : bg);
            const border = t.border || '#e2e8f0';

            const contrast = calculateContrastRatio(fg, bg);
            const contrastPasses = contrast >= 4.5;

            return (
              <div
                key={theme.id}
                className="card"
                data-theme-card={theme.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isDefault ? '2px solid var(--gold)' : '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{theme.name}</h3>
                    {isDefault && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'var(--gold)',
                          color: '#000',
                          textTransform: 'uppercase',
                        }}
                      >
                        Default Site Theme
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                    {theme.id}
                  </div>

                  {/* Swatches Bar */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 28,
                        background: bg,
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        color: fg,
                      }}
                      title={`Background: ${bg}`}
                    >
                      bg
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 28,
                        background: fg,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        color: bg,
                      }}
                      title={`Foreground: ${fg}`}
                    >
                      fg
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 28,
                        background: accent,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        color: '#fff',
                      }}
                      title={`Accent: ${accent}`}
                    >
                      accent
                    </div>
                  </div>

                  {/* Mini Preview Box */}
                  <div
                    style={{
                      background: bg,
                      color: fg,
                      padding: 12,
                      borderRadius: t.radius || '6px',
                      border: `1px solid ${border}`,
                      marginBottom: 12,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontFamily: t.fontHeading || 'inherit', fontWeight: 700, marginBottom: 4 }}>
                      Typography & Accent
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8 }}>
                      Body copy rendered in specified tokens.
                    </div>
                    <button
                      style={{
                        background: accent,
                        color: bg,
                        border: 'none',
                        borderRadius: t.radius || '4px',
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'default',
                      }}
                    >
                      CTA Action
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
                    <span>WCAG AA:</span>
                    <span style={{ color: contrastPasses ? 'var(--ok)' : 'var(--danger)', fontWeight: 600 }}>
                      {contrast.toFixed(1)}:1 {contrastPasses ? '✓ Pass' : '⚠ Low'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  {!isDefault && (
                    <button
                      className="btn ghost"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                      onClick={() => handleSetDefault(theme.id, theme.name)}
                      id={`set-default-${theme.id}`}
                    >
                      Set as site theme
                    </button>
                  )}
                  <button
                    className="btn ghost"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => setEditingTheme(theme)}
                    id={`edit-theme-${theme.id}`}
                  >
                    Edit
                  </button>
                  <button
                    className="btn ghost"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => handleDuplicate(theme.id)}
                    id={`duplicate-theme-${theme.id}`}
                  >
                    Duplicate
                  </button>
                  <button
                    className="btn ghost"
                    style={{ fontSize: 11, padding: '3px 8px', color: 'var(--danger)' }}
                    onClick={() => handleDelete(theme.id, theme.name)}
                    id={`delete-theme-${theme.id}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Theme Modal */}
      {editingTheme && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTheme(null);
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 580,
              width: '100%',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <form onSubmit={handleSaveEdit} className="form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Edit Theme: {editingTheme.name}</h3>
                <button
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}
                >
                  ✕
                </button>
              </div>

              <div className="field">
                <label htmlFor="theme-edit-name">Theme Name</label>
                <input
                  id="theme-edit-name"
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-3" style={{ gap: 12 }}>
                <div className="field">
                  <label htmlFor="token-bg">Background (--bg)</label>
                  <input
                    id="token-bg"
                    type="color"
                    value={editingTheme.tokens.bg || '#ffffff'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, bg: e.target.value },
                      })
                    }
                    style={{ height: 40, padding: 2 }}
                  />
                  <input
                    value={editingTheme.tokens.bg || '#ffffff'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, bg: e.target.value },
                      })
                    }
                    style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="field">
                  <label htmlFor="token-fg">Foreground (--fg)</label>
                  <input
                    id="token-fg"
                    type="color"
                    value={editingTheme.tokens.fg || '#0f172a'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, fg: e.target.value },
                      })
                    }
                    style={{ height: 40, padding: 2 }}
                  />
                  <input
                    value={editingTheme.tokens.fg || '#0f172a'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, fg: e.target.value },
                      })
                    }
                    style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="field">
                  <label htmlFor="token-accent">Accent (--accent)</label>
                  <input
                    id="token-accent"
                    type="color"
                    value={editingTheme.tokens.accent || '#2563eb'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, accent: e.target.value },
                      })
                    }
                    style={{ height: 40, padding: 2 }}
                  />
                  <input
                    value={editingTheme.tokens.accent || '#2563eb'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, accent: e.target.value },
                      })
                    }
                    style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: 12 }}>
                <div className="field">
                  <label htmlFor="token-radius">Border Radius (--radius)</label>
                  <input
                    id="token-radius"
                    value={editingTheme.tokens.radius || '8px'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, radius: e.target.value },
                      })
                    }
                    placeholder="8px or 0px or 9999px"
                  />
                </div>

                <div className="field">
                  <label htmlFor="token-font-heading">Font Heading (--font-heading)</label>
                  <input
                    id="token-font-heading"
                    value={editingTheme.tokens.fontHeading || 'system-ui, sans-serif'}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        tokens: { ...editingTheme.tokens, fontHeading: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button type="button" className="btn ghost" onClick={() => setEditingTheme(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold" disabled={saving} id="save-theme-edit-btn">
                  {saving ? 'Saving...' : 'Save Theme Tokens'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Theme Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 580,
              width: '100%',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <form onSubmit={handleCreateTheme} className="form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Create Custom Theme</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}
                >
                  ✕
                </button>
              </div>

              <div className="field">
                <label htmlFor="new-theme-name">Theme Name</label>
                <input
                  id="new-theme-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Midnight Onyx"
                  required
                />
              </div>

              <div className="grid grid-3" style={{ gap: 12 }}>
                <div className="field">
                  <label>Background</label>
                  <input
                    type="color"
                    value={newTokens.bg}
                    onChange={(e) => setNewTokens({ ...newTokens, bg: e.target.value })}
                    style={{ height: 40, padding: 2 }}
                  />
                  <input
                    value={newTokens.bg}
                    onChange={(e) => setNewTokens({ ...newTokens, bg: e.target.value })}
                    style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="field">
                  <label>Foreground</label>
                  <input
                    type="color"
                    value={newTokens.fg}
                    onChange={(e) => setNewTokens({ ...newTokens, fg: e.target.value })}
                    style={{ height: 40, padding: 2 }}
                  />
                  <input
                    value={newTokens.fg}
                    onChange={(e) => setNewTokens({ ...newTokens, fg: e.target.value })}
                    style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="field">
                  <label>Accent</label>
                  <input
                    type="color"
                    value={newTokens.accent}
                    onChange={(e) => setNewTokens({ ...newTokens, accent: e.target.value })}
                    style={{ height: 40, padding: 2 }}
                  />
                  <input
                    value={newTokens.accent}
                    onChange={(e) => setNewTokens({ ...newTokens, accent: e.target.value })}
                    style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: 12 }}>
                <div className="field">
                  <label>Border Radius</label>
                  <input
                    value={newTokens.radius}
                    onChange={(e) => setNewTokens({ ...newTokens, radius: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Font Heading</label>
                  <input
                    value={newTokens.fontHeading}
                    onChange={(e) => setNewTokens({ ...newTokens, fontHeading: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button type="button" className="btn ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold" disabled={saving} id="submit-create-theme">
                  {saving ? 'Creating...' : 'Create Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
