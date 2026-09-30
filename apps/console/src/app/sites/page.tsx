'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SiteItem {
  id: string;
  name: string;
  domain: string;
  origin: string;
  siteKey: string;
  defaultThemeId: string;
  status: string;
  creatorsCount: number;
  activeCampaignsCount: number;
  upliftSummary: string;
  isSignificant: boolean;
  createdAt: string;
}

export default function SitesPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdSite, setCreatedSite] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites || []);
      }
    } catch (e) {
      console.error('Failed to load sites', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), domain: domain.trim() }),
      });

      if (res.ok) {
        const newSite = await res.json();
        setCreatedSite(newSite);
        fetchSites();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create site');
      }
    } catch (e) {
      alert('Network error creating site');
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (siteId: string) => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/sites/${siteId}/verify`);
      const data = await res.json();
      setVerifyResult(data);
    } catch {
      setVerifyResult({ verified: false, message: 'Ping failed: could not connect' });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p className="kicker">Multi-Tenant Platform</p>
          <h1 style={{ marginBottom: 6 }}>Sites</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Manage storefront sites, site keys, and personalized creator themes.
          </p>
        </div>
        <button
          className="btn gold"
          onClick={() => {
            setShowAddModal(true);
            setCreatedSite(null);
            setVerifyResult(null);
            setName('');
            setDomain('');
          }}
          id="add-site-btn"
        >
          + Add site
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading sites...</p>
      ) : sites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>No sites configured yet</h3>
          <p style={{ color: 'var(--muted)', marginTop: 8, marginBottom: 16 }}>
            Connect your first storefront to start personalizing themes and creator experiences.
          </p>
          <button
            className="btn gold"
            onClick={() => setShowAddModal(true)}
          >
            + Add your first site
          </button>
        </div>
      ) : (
        <table className="table" id="sites-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Origin / Domain</th>
              <th>Public Key</th>
              <th>Creators</th>
              <th>Campaigns</th>
              <th>Uplift</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id} data-site-row={site.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{site.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{site.id}</div>
                </td>
                <td>
                  <a
                    href={site.domain}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--gold)', textDecoration: 'none' }}
                  >
                    {site.domain} ↗
                  </a>
                </td>
                <td>
                  <button
                    onClick={() => copyToClipboard(site.siteKey || site.id, site.id)}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--fg)',
                      cursor: 'pointer',
                    }}
                    title="Click to copy site key"
                  >
                    {copiedKey === site.id ? 'Copied!' : `${(site.siteKey || site.id || '').slice(0, 14)}...`}
                  </button>
                </td>
                <td>
                  <span className="pill">{site.creatorsCount} creators</span>
                </td>
                <td>
                  <span className="pill">{site.activeCampaignsCount} active</span>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 600,
                      color: site.isSignificant ? 'var(--ok)' : 'var(--muted)',
                    }}
                  >
                    {site.upliftSummary}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      background: site.status === 'active' ? 'var(--ok)' : 'var(--muted)',
                      color: '#fff',
                    }}
                  >
                    {site.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    href={`/sites/${site.id}`}
                    className="btn gold"
                    style={{ padding: '4px 12px', fontSize: 12 }}
                    id={`open-site-${site.id}`}
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Site Modal */}
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
            {!createdSite ? (
              <form onSubmit={handleCreateSite} className="form">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Add New Site</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}
                  >
                    ✕
                  </button>
                </div>

                <div className="field">
                  <label htmlFor="site-name-input">Site Name</label>
                  <input
                    id="site-name-input"
                    type="text"
                    placeholder="e.g. Modern Athletics Store"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="site-domain-input">Site Origin / Domain</label>
                  <input
                    id="site-domain-input"
                    type="text"
                    placeholder="e.g. http://localhost:3002 or https://store.example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                    Used for dashboard live preview iframes and CORS configuration.
                  </small>
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
                    id="submit-add-site"
                  >
                    {creating ? 'Creating...' : 'Create Site'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, color: 'var(--ok)' }}>✓ Site Created Successfully</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 16 }}>
                  <strong>{createdSite.name}</strong> is registered. Drop the snippet into your storefront’s <code>&lt;head&gt;</code> to activate creator themes and zero-CLS personalization.
                </p>

                <div className="card" style={{ background: 'var(--surface)', padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Public Site Key
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: 13, color: 'var(--gold)' }}>{createdSite.siteKey}</code>
                    <button
                      className="btn ghost"
                      style={{ padding: '2px 8px', fontSize: 11 }}
                      onClick={() => copyToClipboard(createdSite.siteKey, 'modal-key')}
                    >
                      {copiedKey === 'modal-key' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label>1. HTML / Script Tag</label>
                  <pre
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: 10,
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      overflowX: 'auto',
                    }}
                  >
{`<script src="http://localhost:3000/api/sdk/${createdSite.id}" defer></script>`}
                  </pre>
                </div>

                <div className="field" style={{ marginBottom: 20 }}>
                  <label>2. Verify Storefront Installation</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => handleVerify(createdSite.id)}
                      disabled={verifying}
                      id="verify-install-btn"
                    >
                      {verifying ? 'Pinging Origin...' : 'Verify Install'}
                    </button>
                    {verifyResult && (
                      <span
                        style={{
                          fontSize: 12,
                          color: verifyResult.verified ? 'var(--ok)' : 'var(--danger)',
                          fontWeight: 500,
                        }}
                      >
                        {verifyResult.verified ? '✓ Verified reachable' : `✗ ${verifyResult.message || 'Not detected'}`}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Link
                    href={`/sites/${createdSite.id}`}
                    className="btn gold"
                    id="go-to-workspace-btn"
                  >
                    Open Site Workspace →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
