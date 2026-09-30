'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { themeToCssVars } from '@vibe/core';

interface Creator {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  handle: string;
  themeId: string | null;
}

interface ThemeItem {
  id: string;
  name: string;
  tokens: any;
}

export default function SiteBuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params?.siteId as string;
  const campaignIdParam = searchParams.get('campaignId');

  const [site, setSite] = useState<any>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [themeId, setThemeId] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [cta, setCta] = useState('Shop Collection');
  const [offer, setOffer] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [hero, setHero] = useState('/images/hero-fitfiona.jpg');
  const [holdoutPct, setHoldoutPct] = useState(10);
  const [status, setStatus] = useState('active');

  // Local theme token overrides (does NOT mutate base theme)
  const [overrideTokens, setOverrideTokens] = useState<any>({});
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchData = async () => {
    try {
      const [siteRes, creatorsRes, themesRes] = await Promise.all([
        fetch(`/api/sites/${siteId}`),
        fetch(`/api/sites/${siteId}/creators`),
        fetch(`/api/sites/${siteId}/themes`),
      ]);

      let siteOrigin = 'http://localhost:3002';
      if (siteRes.ok) {
        const s = await siteRes.json();
        setSite(s.site);
        siteOrigin = s.site.origin || s.site.domain;
      }

      let loadedCreators: Creator[] = [];
      if (creatorsRes.ok) {
        const c = await creatorsRes.json();
        loadedCreators = c.creators || [];
        setCreators(loadedCreators);
      }

      let loadedThemes: ThemeItem[] = [];
      if (themesRes.ok) {
        const t = await themesRes.json();
        loadedThemes = t.themes || [];
        setThemes(loadedThemes);
      }

      // If editing existing campaign
      if (campaignIdParam) {
        const campRes = await fetch(`/api/sites/${siteId}/campaigns`);
        if (campRes.ok) {
          const campData = await campRes.json();
          const target = (campData.campaigns || []).find((x: any) => x.id === campaignIdParam);
          if (target) {
            setName(target.name || '');
            setCreatorId(target.creatorId || '');
            setThemeId(target.themeId || '');
            setHeadline(target.headline || '');
            setSubheadline(target.subheadline || '');
            setCta(target.cta || 'Shop Collection');
            setOffer(target.offer || '');
            setPromoCode(target.promoCode || '');
            setHero(target.hero || '/images/hero-fitfiona.jpg');
            setHoldoutPct(target.holdoutPct ?? 10);
            setStatus(target.status || 'active');
          }
        }
      } else {
        // Defaults for new campaign
        if (loadedCreators.length > 0 && !creatorId) {
          setCreatorId(loadedCreators[0].id);
          const firstCrTheme = loadedCreators[0].themeId;
          if (firstCrTheme) setThemeId(firstCrTheme);
        }
        if (loadedThemes.length > 0 && !themeId) {
          setThemeId(loadedThemes[0].id);
        }
      }
    } catch (e) {
      console.error('Error loading builder data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) fetchData();
  }, [siteId, campaignIdParam]);

  const selectedCreator = creators.find((c) => c.id === creatorId);
  const selectedBaseTheme = themes.find((t) => t.id === themeId);

  // When creator changes, auto-select creator's assigned theme if available
  const handleCreatorChange = (newCrId: string) => {
    setCreatorId(newCrId);
    const cr = creators.find((c) => c.id === newCrId);
    if (cr?.themeId) {
      setThemeId(cr.themeId);
    }
  };

  const effectiveTheme = {
    ...(selectedBaseTheme?.tokens || {}),
    ...overrideTokens,
  };

  const cssVars = themeToCssVars(effectiveTheme);

  // Build live preview URL: {site.origin}/?vibe={slug}&preview=1&draft_theme={...}&draft_slots={...}
  const siteOrigin = site?.origin || site?.domain || 'http://localhost:3002';
  const creatorSlug = selectedCreator ? selectedCreator.slug : 'fitfiona';
  const previewUrl = `${siteOrigin}/?vibe=${creatorSlug}&preview=1&force_vibe=1&draft_theme=${encodeURIComponent(
    JSON.stringify(effectiveTheme)
  )}&draft_slots=${encodeURIComponent(
    JSON.stringify({ headline, subheadline, cta, offer, hero })
  )}`;

  const [debouncedUrl, setDebouncedUrl] = useState(previewUrl);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUrl(previewUrl);
    }, 350);
    return () => clearTimeout(handler);
  }, [previewUrl]);

  // Real-time zero-lag live typing sync to iframe preview
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'VIBE_PREVIEW_UPDATE',
          theme: effectiveTheme,
          slots: { headline, subheadline, cta, offer, hero },
        },
        '*'
      );
    }
  }, [headline, subheadline, cta, offer, hero, effectiveTheme]);

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    setSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch(`/api/sites/${siteId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          creatorId,
          themeId,
          headline,
          subheadline,
          cta,
          offer,
          promoCode,
          hero,
          holdoutPct: Number(holdoutPct),
          status,
          overrideTokens, // Saved at campaign level without mutating base theme in themes table
        }),
      });

      if (res.ok) {
        setSaveMessage('✓ Campaign saved successfully! Live revalidation triggered.');
        setIframeKey((k) => k + 1);
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save campaign');
      }
    } catch {
      alert('Network error saving campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading Campaign Builder...</p>;
  }

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
              href={siteOrigin}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none' }}
            >
              {siteOrigin.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
          <h1 style={{ marginBottom: 4 }}>Campaign Builder</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Configure personalized slot copy and Theme Lab pairings with real storefront iframe preview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--surface)', padding: 2, borderRadius: 6, border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              style={{
                background: previewDevice === 'desktop' ? 'var(--gold)' : 'transparent',
                color: previewDevice === 'desktop' ? '#000' : 'var(--muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              style={{
                background: previewDevice === 'mobile' ? 'var(--gold)' : 'transparent',
                color: previewDevice === 'mobile' ? '#000' : 'var(--muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Mobile
            </button>
          </div>

          <button
            type="button"
            className="btn gold"
            onClick={handleSaveCampaign}
            disabled={saving}
            id="builder-save-btn"
          >
            {saving ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div style={{ padding: 12, borderRadius: 6, background: 'rgba(34,197,94,0.15)', color: 'var(--ok)', fontSize: 13 }}>
          {saveMessage}
        </div>
      )}

      {/* Main 2-Column Studio Grid: Left Controls / Right Real Storefront Iframe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 460px) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Controls Column */}
        <form onSubmit={handleSaveCampaign} className="space-y-4" style={{ minWidth: 0 }}>
          <div className="card form" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Campaign Identity</h3>

            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="b-name">Campaign Name</label>
              <input
                id="b-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fiona Summer Conditioning Drop"
                required
              />
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="b-creator">Target Creator</label>
              <select
                id="b-creator"
                value={creatorId}
                onChange={(e) => handleCreatorChange(e.target.value)}
              >
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName} ({c.handle})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="b-theme">Theme from Lab</label>
                <Link
                  href={`/sites/${siteId}/themes`}
                  target="_blank"
                  style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none' }}
                >
                  + Open Theme Lab ↗
                </Link>
              </div>
              <select
                id="b-theme"
                value={themeId}
                onChange={(e) => {
                  setThemeId(e.target.value);
                  setOverrideTokens({}); // reset overrides on theme change
                }}
              >
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slot Content Controls */}
          <div className="card form" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Slot Content Personalization</h3>

            <div className="field">
              <label htmlFor="b-headline">Headline Slot (data-vibe-slot="headline")</label>
              <input
                id="b-headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Custom personalized hero headline..."
              />
            </div>

            <div className="field">
              <label htmlFor="b-subheadline">Subheadline Slot (data-vibe-slot="subheadline")</label>
              <textarea
                id="b-subheadline"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                rows={2}
                placeholder="Curated copy explaining the collection..."
              />
            </div>

            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="field">
                <label htmlFor="b-cta">CTA Button Text</label>
                <input
                  id="b-cta"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="b-offer">Offer / Discount Code</label>
                <input
                  id="b-offer"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="e.g. Save 20% with code FIT20"
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="field">
                <label htmlFor="b-holdout">Holdout A/B %</label>
                <input
                  id="b-holdout"
                  type="number"
                  min="0"
                  max="50"
                  value={holdoutPct}
                  onChange={(e) => setHoldoutPct(Number(e.target.value))}
                />
              </div>

              <div className="field">
                <label htmlFor="b-status">Status</label>
                <select
                  id="b-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaign-level Theme Overrides (without mutating base theme) */}
          <div className="card form" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Theme Overrides (Campaign-level)</h3>
              {Object.keys(overrideTokens).length > 0 && (
                <button
                  type="button"
                  onClick={() => setOverrideTokens({})}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 11, cursor: 'pointer' }}
                >
                  Reset overrides
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 12px' }}>
              Base theme: <strong>{selectedBaseTheme?.name}</strong>. Edits here apply only to this campaign and do not mutate the base Theme Lab record.
            </p>

            <div className="grid grid-3" style={{ gap: 8 }}>
              <div className="field">
                <label style={{ fontSize: 11 }}>Accent</label>
                <input
                  type="color"
                  value={effectiveTheme.accent || '#2563eb'}
                  onChange={(e) => setOverrideTokens({ ...overrideTokens, accent: e.target.value })}
                  style={{ height: 32, padding: 1 }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 11 }}>Background</label>
                <input
                  type="color"
                  value={effectiveTheme.bg || '#ffffff'}
                  onChange={(e) => setOverrideTokens({ ...overrideTokens, bg: e.target.value })}
                  style={{ height: 32, padding: 1 }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 11 }}>Foreground</label>
                <input
                  type="color"
                  value={effectiveTheme.fg || '#0f172a'}
                  onChange={(e) => setOverrideTokens({ ...overrideTokens, fg: e.target.value })}
                  style={{ height: 32, padding: 1 }}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Real Storefront Iframe Preview Column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              fontSize: 12,
              color: 'var(--muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="w-2 h-2 rounded-full bg-accent" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)' }} />
              <span>Live Store Preview:</span>
              <code style={{ fontSize: 11, color: 'var(--fg)' }}>{previewUrl.slice(0, 48)}...</code>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: 12 }}
            >
              Open in New Window ↗
            </a>
          </div>

          <div
            style={{
              width: previewDevice === 'mobile' ? '375px' : '100%',
              height: '740px',
              borderRadius: 12,
              overflow: 'hidden',
              border: '2px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
              transition: 'width 0.25s ease',
            }}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={debouncedUrl}
              title="Storefront Live Iframe Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              id="storefront-preview-iframe"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
