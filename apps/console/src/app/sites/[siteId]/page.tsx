'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SiteOverviewPage() {
  const params = useParams();
  const siteId = params?.siteId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchSiteData = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setName(json.site.name);
        setDomain(json.site.domain);
      }
    } catch (e) {
      console.error('Failed to load site data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) fetchSiteData();
  }, [siteId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain }),
      });
      if (res.ok) {
        setIsEditing(false);
        fetchSiteData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update site');
      }
    } catch {
      alert('Error updating site');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/sites/${siteId}/verify`);
      const result = await res.json();
      setVerifyResult(result);
    } catch {
      setVerifyResult({ verified: false, message: 'Could not contact site origin.' });
    } finally {
      setVerifying(false);
    }
  };

  const copyKey = () => {
    if (data?.site?.siteKey) {
      navigator.clipboard.writeText(data.site.siteKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading site workspace...</p>;
  }

  if (!data?.site) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <h3>Site not found or access denied</h3>
        <Link href="/sites" className="btn gold" style={{ marginTop: 16 }}>
          Return to All Sites
        </Link>
      </div>
    );
  }

  const { site, metrics } = data;

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p className="kicker" style={{ margin: 0 }}>Site Workspace</p>
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                background: site.status === 'active' ? 'var(--ok)' : 'var(--muted)',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {site.status}
            </span>
          </div>

          <h1 style={{ marginTop: 4, marginBottom: 6 }}>{site.name}</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Storefront origin:{' '}
            <a href={site.domain} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>
              {site.domain} ↗
            </a>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn ghost"
            onClick={() => setIsEditing(!isEditing)}
            id="edit-site-btn"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Site Info'}
          </button>
          <a
            href={site.domain}
            target="_blank"
            rel="noreferrer"
            className="btn gold"
            id="view-storefront-btn"
          >
            Open Storefront ↗
          </a>
        </div>
      </div>

      {/* Edit Form Drawer */}
      {isEditing && (
        <form onSubmit={handleSaveSettings} className="card form" style={{ background: 'var(--surface)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Edit Site Settings</h3>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="edit-name">Site Name</label>
              <input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="edit-domain">Origin / Domain</label>
              <input
                id="edit-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn gold" disabled={saving} id="save-site-btn">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        <div className="card">
          <p className="kicker">Holdout Uplift</p>
          <div
            className="stat"
            style={{ color: metrics.relativeUplift > 0 ? 'var(--ok)' : 'var(--muted)' }}
          >
            {metrics.relativeUplift >= 0 ? '+' : ''}
            {metrics.relativeUplift}%
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            {metrics.isSignificant ? '✓ Significant at 95% CI' : 'Gathering sample data'} · z={metrics.zScore}
          </p>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 6, color: 'var(--muted)' }}>
            {metrics.creatorsCount} creators · {metrics.activeCampaignsCount} active campaigns
          </p>
        </div>

        <div className="card">
          <p className="kicker">Performance & Zero CLS</p>
          <div
            className="stat"
            style={{ color: metrics.execMsP95 <= 50 ? 'var(--ok)' : 'var(--danger)' }}
          >
            {metrics.execMsP95}ms
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            SDK CPU p95 · Target &lt;50ms
          </p>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 6, color: 'var(--muted)' }}>
            CLS p95: {metrics.clsP95.toFixed(3)} (Target &lt;0.01)
          </p>
        </div>

        <div className="card">
          <p className="kicker">Storefront Install</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Site Key</span>
              <button
                className="btn ghost"
                style={{ padding: '2px 8px', fontSize: 11 }}
                onClick={copyKey}
                id="copy-site-key-btn"
              >
                {copiedKey ? 'Copied!' : 'Copy Key'}
              </button>
            </div>
            <code style={{ fontSize: 11, background: 'var(--surface)', padding: '4px 8px', borderRadius: 4, color: 'var(--gold)', overflowX: 'auto' }}>
              {site.siteKey}
            </code>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn ghost"
                style={{ fontSize: 11, padding: '4px 8px' }}
                onClick={handleVerify}
                disabled={verifying}
                id="verify-install-action"
              >
                {verifying ? 'Checking...' : 'Verify Ping'}
              </button>
              {verifyResult && (
                <span
                  style={{
                    fontSize: 11,
                    color: verifyResult.verified ? 'var(--ok)' : 'var(--danger)',
                    fontWeight: 500,
                  }}
                >
                  {verifyResult.verified ? '✓ Active' : '✗ Offline'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation to Workspace Features */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: 12 }}>
        Workspace Modules
      </h2>
      <div className="grid grid-3" style={{ gap: 16 }}>
        <Link
          href={`/sites/${siteId}/creators`}
          className="card"
          style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
          id="nav-to-creators"
        >
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Creators ({metrics.creatorsCount})</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Manage creator slugs, handles, live links, and theme pairings.
          </p>
        </Link>

        <Link
          href={`/sites/${siteId}/themes`}
          className="card"
          style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
          id="nav-to-themes"
        >
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Theme Lab</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Curate design tokens, test WCAG contrast, and assign default site theme.
          </p>
        </Link>

        <Link
          href={`/sites/${siteId}/campaigns`}
          className="card"
          style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
          id="nav-to-campaigns"
        >
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Campaigns ({metrics.activeCampaignsCount})</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Personalized slot copy, bundle rules, and A/B holdout allocations.
          </p>
        </Link>

        <Link
          href={`/sites/${siteId}/dna`}
          className="card"
          style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
          id="nav-to-dna"
        >
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Site DNA</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Storefront brand palette, typography, tone, and audience archetype.
          </p>
        </Link>

        <Link
          href={`/sites/${siteId}/builder`}
          className="card"
          style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
          id="nav-to-builder"
        >
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Campaign Builder</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Interactive slot builder with live iframe preview of your real storefront.
          </p>
        </Link>

        <Link
          href={`/sites/${siteId}/uplift`}
          className="card"
          style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
          id="nav-to-uplift"
        >
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Uplift & RUM</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Statistical significance engine, conversion uplift, and CLS monitoring.
          </p>
        </Link>
      </div>

      {/* Integration Code Snippet */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Installation Code</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Drop this snippet into your website to enable zero-CLS creator personalization and dynamic themes.
        </p>

        <div className="field">
          <label>Standard HTML Snippet (&lt;head&gt;)</label>
          <pre
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: 12,
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              overflowX: 'auto',
            }}
          >
{`<script src="http://localhost:3000/api/sdk/${site.id}" defer></script>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
