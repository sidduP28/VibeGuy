'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ThemeItem {
  id: string;
  name: string;
  key?: string;
}

interface CampaignItem {
  id: string;
  siteId: string;
  name: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorSlug: string;
  productUrl?: string;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
  themeId: string;
  themeName: string;
  holdoutPct: number;
  status: string;
  vibeLink?: string;
  previewLink?: string;
  productPreviewUrl?: string;
  createdAt: string;
}

export default function SiteCampaignsPage() {
  const params = useParams();
  const siteId = params?.siteId as string;

  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>([]);
  const [themesList, setThemesList] = useState<ThemeItem[]>([]);
  const [siteInfo, setSiteInfo] = useState<{ id: string; name: string; domain: string } | null>(null);
  const [themeSelectMap, setThemeSelectMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}/campaigns`);
      if (res.ok) {
        const data = await res.json();
        setCampaignsList(data.campaigns || []);
        if (data.themes) setThemesList(data.themes);
        if (data.site) setSiteInfo(data.site);
      }
    } catch (e) {
      console.error('Failed to load campaigns', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) fetchCampaigns();
  }, [siteId]);

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="kicker">Site Workspace</p>
          <h1 style={{ marginBottom: 4 }}>Campaigns</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Personalized campaigns targeting creator traffic with separate products and custom themes.
          </p>
        </div>
        <Link
          href={`/sites/${siteId}/builder`}
          className="btn gold"
          id="new-campaign-btn"
        >
          + Launch Campaign in Builder
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading campaigns...</p>
      ) : campaignsList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          <h3>No campaigns for this site yet</h3>
          <p style={{ color: 'var(--muted)', marginTop: 8, marginBottom: 16 }}>
            Use Campaign Builder to craft slot headlines, curate theme tokens, and launch.
          </p>
          <Link href={`/sites/${siteId}/builder`} className="btn gold">
            Open Campaign Builder
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Campaign & Creator</th>
                <th>Separate Product</th>
                <th>Separate Theme</th>
                <th>Holdout</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Preview Store & Theme</th>
              </tr>
            </thead>
            <tbody>
              {campaignsList.map((cmp) => {
                const effectiveSlug = (cmp.creatorSlug && cmp.creatorSlug.trim()) || cmp.creatorId;
                const domain = (siteInfo?.domain && siteInfo.domain.trim()) || 'http://localhost:3002';
                const liveUrl = cmp.vibeLink && !cmp.vibeLink.endsWith('?vibe=') ? cmp.vibeLink : `${domain}/?vibe=${effectiveSlug}`;
                const chosenTheme = themeSelectMap[cmp.id] !== undefined ? themeSelectMap[cmp.id] : (cmp.themeId || '');

                const productUrlBase = cmp.productUrl || `${domain}/product/fit-bands`;
                const previewProductUrl = productUrlBase.includes('?')
                  ? `${productUrlBase}&vibe=${effectiveSlug}&preview=1&force_vibe=1${chosenTheme ? `&theme=${encodeURIComponent(chosenTheme)}` : ''}`
                  : `${productUrlBase}?vibe=${effectiveSlug}&preview=1&force_vibe=1${chosenTheme ? `&theme=${encodeURIComponent(chosenTheme)}` : ''}`;

                const previewStoreUrl = `${liveUrl}&preview=1&force_vibe=1${chosenTheme ? `&theme=${encodeURIComponent(chosenTheme)}` : ''}`;

                const cleanProductPath = productUrlBase.replace(/https?:\/\/[^/]+/, '');

                return (
                  <tr key={cmp.id} data-campaign-row={cmp.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{cmp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{cmp.id}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>{cmp.creatorName}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{cmp.creatorHandle}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                          title="Live creator link"
                        >
                          ?vibe={effectiveSlug}
                        </a>
                        <button
                          className="btn ghost"
                          style={{ padding: '1px 5px', fontSize: 10, lineHeight: 1 }}
                          onClick={() => {
                            navigator.clipboard.writeText(liveUrl);
                            setCopiedId(cmp.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          title="Copy vibe link"
                        >
                          {copiedId === cmp.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg)' }}>
                          {cmp.productTitle || 'Featured Product'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {cmp.productPrice && (
                            <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                              {cmp.productPrice}
                            </span>
                          )}
                          <a
                            href={previewProductUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                            title="Direct product link"
                          >
                            {cleanProductPath} ↗
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          background: 'var(--surface)',
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          color: 'var(--gold)',
                          display: 'inline-block',
                        }}
                      >
                        {cmp.themeName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{cmp.holdoutPct}%</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          background: cmp.status === 'active' ? 'var(--ok)' : 'var(--muted)',
                          color: '#fff',
                        }}
                      >
                        {cmp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Theme Switcher Dropdown */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '3px 8px',
                          }}
                        >
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Theme:</span>
                          <select
                            value={chosenTheme}
                            onChange={(e) => setThemeSelectMap((prev) => ({ ...prev, [cmp.id]: e.target.value }))}
                            style={{
                              fontSize: 11,
                              background: 'transparent',
                              color: 'var(--gold)',
                              border: 'none',
                              outline: 'none',
                              cursor: 'pointer',
                              maxWidth: 130,
                            }}
                            title="Choose theme to preview this campaign with"
                          >
                            <option value={cmp.themeId || ''} style={{ background: '#1a1611', color: '#fff' }}>
                              Assigned ({cmp.themeName})
                            </option>
                            {themesList
                              .filter((t) => t.id !== cmp.themeId)
                              .map((t) => (
                                <option key={t.id} value={t.id} style={{ background: '#1a1611', color: '#fff' }}>
                                  {t.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Preview Assigned Product with Theme */}
                        <a
                          href={previewProductUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn gold"
                          style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                          title={`Preview assigned product (${cmp.productTitle}) with vibe=${effectiveSlug} and theme`}
                        >
                          <span>Preview Product ↗</span>
                        </a>

                        {/* Preview Storefront Home with Theme */}
                        <a
                          href={previewStoreUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn ghost"
                          style={{ fontSize: 11, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                          title={`Preview storefront collection with vibe=${effectiveSlug} and theme`}
                        >
                          <span>Store Home ↗</span>
                        </a>

                        <Link
                          href={`/sites/${siteId}/builder?campaignId=${cmp.id}`}
                          className="btn ghost"
                          style={{ fontSize: 11, padding: '3px 8px' }}
                        >
                          Builder →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
