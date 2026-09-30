'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CreatorItem {
  id: string;
  siteId: string;
  slug: string;
  displayName: string;
  name: string;
  handle: string;
  niche: string;
  themeId: string | null;
  themeName: string;
  copyOverrides: Record<string, string>;
  status: string;
  vibeLink: string;
  createdAt: string;
}

interface ThemeItem {
  id: string;
  name: string;
  isBuiltin: boolean;
}

export default function SiteCreatorsPage() {
  const params = useParams();
  const siteId = params?.siteId as string;

  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [site, setSite] = useState<{ id: string; name: string; domain: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [themeSelectMap, setThemeSelectMap] = useState<Record<string, string>>({});

  // Add Creator Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('Shop Collection');
  const [offer, setOffer] = useState('');
  const [bundleText, setBundleText] = useState('');
  const [heroImage, setHeroImage] = useState('/images/hero-fitfiona.jpg');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit Creator state
  const [editingCreator, setEditingCreator] = useState<CreatorItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = async () => {
    try {
      const [creatorsRes, themesRes, siteRes] = await Promise.all([
        fetch(`/api/sites/${siteId}/creators`),
        fetch(`/api/sites/${siteId}/themes`),
        fetch(`/api/sites/${siteId}`),
      ]);

      if (creatorsRes.ok) {
        const data = await creatorsRes.json();
        setCreators(data.creators || []);
      }
      if (themesRes.ok) {
        const data = await themesRes.json();
        setThemes(data.themes || []);
        if (data.themes?.length > 0 && !selectedThemeId) {
          setSelectedThemeId(data.themes[0].id);
        }
      }
      if (siteRes.ok) {
        const sData = await siteRes.json();
        if (sData.site) setSite(sData.site);
      }
    } catch (e) {
      console.error('Failed to load creators or themes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) fetchData();
  }, [siteId]);

  const handleNameChange = (val: string) => {
    setDisplayName(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    try {
      const res = await fetch(`/api/sites/${siteId}/creators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          slug,
          handle: handle || `@${slug}`,
          themeId: selectedThemeId || null,
          copyOverrides: {
            headline: headline || `${displayName}'s Private Collection`,
            subheadline,
            ctaText,
            offer,
            bundleText,
            heroImage,
          },
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setDisplayName('');
        setSlug('');
        setHandle('');
        setHeadline('');
        setSubheadline('');
        setOffer('');
        setBundleText('');
        fetchData();
      } else {
        const err = await res.json();
        setCreateError(err.error || 'Failed to create creator');
      }
    } catch {
      setCreateError('Network error adding creator');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreator) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/creators/${editingCreator.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editingCreator.displayName,
          slug: editingCreator.slug,
          handle: editingCreator.handle,
          themeId: editingCreator.themeId,
          status: editingCreator.status,
          copyOverrides: editingCreator.copyOverrides,
        }),
      });

      if (res.ok) {
        setEditingCreator(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update creator');
      }
    } catch {
      alert('Error updating creator');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCreator = async (creatorId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/sites/${siteId}/creators/${creatorId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete creator');
      }
    } catch {
      alert('Error deleting creator');
    }
  };

  const copyLiveLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="kicker" style={{ margin: 0 }}>
              {site?.name || (siteId === 'site_aurora' ? 'Aurora Atelier' : siteId)}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>•</span>
            <a
              href={site?.domain || 'http://localhost:3002'}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none' }}
            >
              {(site?.domain || 'http://localhost:3002').replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
          <h1 style={{ marginBottom: 4 }}>Creators</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Manage creator handles, unique vibe links, and assigned themes from Theme Lab.
          </p>
        </div>
        <button
          className="btn gold"
          onClick={() => {
            setShowAddModal(true);
            setCreateError('');
          }}
          id="add-creator-btn"
        >
          + Add Creator
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading creators...</p>
      ) : creators.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          <h3>No creators assigned to this site yet</h3>
          <p style={{ color: 'var(--muted)', marginTop: 8, marginBottom: 16 }}>
            Add your first creator to generate custom vibe links and personalized storefront experiences.
          </p>
          <button className="btn gold" onClick={() => setShowAddModal(true)}>
            + Add First Creator
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {creators.map((c) => {
            const effectiveSlug = (c.slug && c.slug.trim()) || (c as any).vibeCode || (c.handle ? c.handle.replace(/^@/, '') : c.id);
            const baseDomain = (site?.domain && site.domain.trim()) || 'http://localhost:3002';
            const liveUrl = (c.vibeLink && !c.vibeLink.endsWith('?vibe=')) ? c.vibeLink : `${baseDomain}/?vibe=${effectiveSlug}`;
            const chosenThemeId = themeSelectMap[c.id] !== undefined ? themeSelectMap[c.id] : (c.themeId || '');
            const previewStoreUrl = `${liveUrl}&preview=1&force_vibe=1${chosenThemeId ? `&theme=${encodeURIComponent(chosenThemeId)}` : ''}`;

            return (
              <div key={c.id} className="card" data-creator-card={effectiveSlug} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ margin: 0 }}>{c.displayName || c.name || effectiveSlug}</h3>
                      <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {c.handle || `@${effectiveSlug}`}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--gold)',
                        }}
                      >
                        Theme: {c.themeName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Live Link:</span>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                      >
                        {liveUrl}
                      </a>
                      <button
                        className="btn ghost"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                        onClick={() => copyLiveLink(liveUrl, c.id)}
                      >
                        {copiedLink === c.id ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Theme:</span>
                      <select
                        value={chosenThemeId}
                        onChange={(e) => setThemeSelectMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                        style={{
                          fontSize: 12,
                          background: 'transparent',
                          color: 'var(--gold)',
                          border: 'none',
                          outline: 'none',
                          cursor: 'pointer',
                          maxWidth: 180,
                        }}
                      >
                        <option value={c.themeId || ''} style={{ background: '#1a1611', color: '#fff' }}>
                          Assigned ({c.themeName})
                        </option>
                        {themes
                          .filter((t) => t.id !== c.themeId)
                          .map((t) => (
                            <option key={t.id} value={t.id} style={{ background: '#1a1611', color: '#fff' }}>
                              {t.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <a
                      href={previewStoreUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn gold"
                      style={{ fontSize: 12, padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      title={`Preview store with vibe=${effectiveSlug} and selected theme`}
                    >
                      <span>Preview Store ↗</span>
                    </a>

                    <button
                      className="btn ghost"
                      style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={() => setEditingCreator(c)}
                      id={`edit-creator-${effectiveSlug}`}
                    >
                      Edit Profile
                    </button>
                    <button
                      className="btn ghost"
                      style={{ fontSize: 12, padding: '4px 10px', color: 'var(--danger)' }}
                      onClick={() => handleDeleteCreator(c.id, c.displayName)}
                      id={`delete-creator-${effectiveSlug}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>

              {/* Overrides preview */}
              {c.copyOverrides && Object.keys(c.copyOverrides).length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, fontSize: 12 }}>
                  {c.copyOverrides.headline && (
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Headline: </span>
                      <span style={{ color: 'var(--fg)' }}>{c.copyOverrides.headline}</span>
                    </div>
                  )}
                  {c.copyOverrides.offer && (
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Offer: </span>
                      <span style={{ color: 'var(--fg)' }}>{c.copyOverrides.offer}</span>
                    </div>
                  )}
                  {c.copyOverrides.ctaText && (
                    <div>
                      <span style={{ color: 'var(--muted)' }}>CTA: </span>
                      <span style={{ color: 'var(--fg)' }}>{c.copyOverrides.ctaText}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* Add Creator Modal */}
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
            className="modal"
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <form onSubmit={handleAddCreator} className="form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Add New Creator</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}
                >
                  ✕
                </button>
              </div>

              {createError && (
                <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
                  {createError}
                </div>
              )}

              <div className="grid grid-2" style={{ gap: 16 }}>
                <div className="field">
                  <label htmlFor="cr-name">Creator Display Name</label>
                  <input
                    id="cr-name"
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="cr-slug">Unique Vibe Slug</label>
                  <input
                    id="cr-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="e.g. elenarostova"
                    required
                  />
                  <small style={{ color: 'var(--muted)', fontSize: 11 }}>
                    Used for link: <code>?vibe={slug || 'slug'}</code>
                  </small>
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: 16 }}>
                <div className="field">
                  <label htmlFor="cr-handle">Social Handle</label>
                  <input
                    id="cr-handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@elenarostova"
                  />
                </div>
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="cr-theme">Theme from Theme Lab</label>
                    <Link
                      href={`/sites/${siteId}/themes`}
                      target="_blank"
                      style={{ fontSize: 11, color: 'var(--gold)' }}
                    >
                      + Theme Lab
                    </Link>
                  </div>
                  <select
                    id="cr-theme"
                    value={selectedThemeId}
                    onChange={(e) => setSelectedThemeId(e.target.value)}
                  >
                    {themes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)' }}>
                  Slot Copy Personalization (Optional Overrides)
                </h4>

                <div className="field">
                  <label htmlFor="cr-headline">Hero Headline</label>
                  <input
                    id="cr-headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Deliberate essentials curated by Elena"
                  />
                </div>

                <div className="field">
                  <label htmlFor="cr-subheadline">Hero Subheadline</label>
                  <input
                    id="cr-subheadline"
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    placeholder="Tested across intense training and active conditioning."
                  />
                </div>

                <div className="grid grid-2" style={{ gap: 16 }}>
                  <div className="field">
                    <label htmlFor="cr-cta">Call to Action (CTA)</label>
                    <input
                      id="cr-cta"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="cr-offer">Discount / Special Offer</label>
                    <input
                      id="cr-offer"
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                      placeholder="Save 20% with code ELENA20"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn gold"
                  disabled={creating}
                  id="submit-add-creator"
                >
                  {creating ? 'Saving...' : 'Add Creator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Creator Modal */}
      {editingCreator && (
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
            if (e.target === e.currentTarget) setEditingCreator(null);
          }}
        >
          <div
            className="modal"
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <form onSubmit={handleSaveEdit} className="form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Edit Creator: {editingCreator.displayName}</h3>
                <button
                  type="button"
                  onClick={() => setEditingCreator(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-2" style={{ gap: 16 }}>
                <div className="field">
                  <label htmlFor="edit-cr-name">Display Name</label>
                  <input
                    id="edit-cr-name"
                    value={editingCreator.displayName}
                    onChange={(e) => setEditingCreator({ ...editingCreator, displayName: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-cr-slug">Vibe Slug</label>
                  <input
                    id="edit-cr-slug"
                    value={editingCreator.slug}
                    onChange={(e) => setEditingCreator({ ...editingCreator, slug: e.target.value.toLowerCase() })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: 16 }}>
                <div className="field">
                  <label htmlFor="edit-cr-handle">Handle</label>
                  <input
                    id="edit-cr-handle"
                    value={editingCreator.handle || ''}
                    onChange={(e) => setEditingCreator({ ...editingCreator, handle: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-cr-theme">Theme from Theme Lab</label>
                  <select
                    id="edit-cr-theme"
                    value={editingCreator.themeId || ''}
                    onChange={(e) => setEditingCreator({ ...editingCreator, themeId: e.target.value })}
                  >
                    {themes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)' }}>
                  Slot Personalization Overrides
                </h4>

                <div className="field">
                  <label htmlFor="edit-cr-headline">Headline</label>
                  <input
                    id="edit-cr-headline"
                    value={editingCreator.copyOverrides?.headline || ''}
                    onChange={(e) =>
                      setEditingCreator({
                        ...editingCreator,
                        copyOverrides: { ...editingCreator.copyOverrides, headline: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="edit-cr-subheadline">Subheadline</label>
                  <input
                    id="edit-cr-subheadline"
                    value={editingCreator.copyOverrides?.subheadline || ''}
                    onChange={(e) =>
                      setEditingCreator({
                        ...editingCreator,
                        copyOverrides: { ...editingCreator.copyOverrides, subheadline: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="grid grid-2" style={{ gap: 16 }}>
                  <div className="field">
                    <label htmlFor="edit-cr-cta">CTA Text</label>
                    <input
                      id="edit-cr-cta"
                      value={editingCreator.copyOverrides?.ctaText || ''}
                      onChange={(e) =>
                        setEditingCreator({
                          ...editingCreator,
                          copyOverrides: { ...editingCreator.copyOverrides, ctaText: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="edit-cr-offer">Offer Text</label>
                    <input
                      id="edit-cr-offer"
                      value={editingCreator.copyOverrides?.offer || ''}
                      onChange={(e) =>
                        setEditingCreator({
                          ...editingCreator,
                          copyOverrides: { ...editingCreator.copyOverrides, offer: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setEditingCreator(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn gold"
                  disabled={savingEdit}
                  id="save-creator-edit-btn"
                >
                  {savingEdit ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
