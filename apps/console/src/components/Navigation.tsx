'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SiteInfo {
  id: string;
  name: string;
  domain: string;
  siteKey: string;
  creatorsCount?: number;
}

export function Navigation() {
  const pathname = usePathname();
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Match /sites/:siteId...
  const siteMatch = pathname.match(/^\/sites\/([^\/]+)/);
  const siteId = siteMatch ? siteMatch[1] : null;

  // Initialize theme mode
  useEffect(() => {
    const saved = localStorage.getItem('vibeguy_theme') as 'light' | 'dark' | null;
    if (saved) {
      setThemeMode(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    localStorage.setItem('vibeguy_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  // Fetch sites list for the selector
  useEffect(() => {
    fetch('/api/sites')
      .then((res) => res.json())
      .then((data) => {
        if (data.sites && Array.isArray(data.sites)) {
          setSites(data.sites);
        }
      })
      .catch(() => { });
  }, []);

  const activeSite = sites.find((s) => s.id === siteId);
  const siteDisplayName = activeSite
    ? activeSite.name
    : siteId === 'site_aurora'
      ? 'Aurora Atelier'
      : siteId === 'site_demo'
        ? 'My Store (Demo)'
        : siteId || 'Store';
  const siteDisplayDomain = activeSite?.domain || (siteId === 'site_aurora' ? 'http://localhost:3002' : 'http://localhost:3000');

  const siteLinks = siteId
    ? [
      [`/sites/${siteId}`, 'Overview'],
      [`/sites/${siteId}/creators`, 'Creators'],
      [`/sites/${siteId}/campaigns`, 'Campaigns'],
      [`/sites/${siteId}/dna`, 'Site DNA'],
      [`/sites/${siteId}/themes`, 'Theme Lab'],
      [`/sites/${siteId}/builder`, 'Builder'],
      [`/sites/${siteId}/uplift`, 'Uplift'],
    ]
    : [];

  const mainPlatformLinks = [
    ['/sites', 'Sites & Stores'],
    ['/campaigns', 'Campaigns'],
    ['/campaigns/new', 'Builder'],
    ['/themes', 'Theme Lab'],
    ['/vibedna', 'VibeDNA'],
    ['/analytics', 'Uplift Analytics'],
  ];

  const toolsLinks = [
    ['/extractor', 'Vibe Extractor'],
    ['/installer', 'SDK Installer'],
    ['/pilot', 'VibePilot AI'],
    ['/docs', 'Documentation'],
  ];

  return (
    <aside className="nav">
      <div className="brand">
        <Link href="/sites" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Vibe<span>Guy</span></h1>
        </Link>
      </div>

      {siteId ? (
        <>
          {/* Active Store Showcase Card with Interactive Switcher Drawer */}
          <div
            style={{
              background: '#241f18',
              border: '1px solid #3d3428',
              borderRadius: 8,
              padding: '12px 14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Link
                href="/sites"
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                  background: 'transparent',
                }}
              >
                <span>←</span>
                <span>All Stores</span>
              </Link>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  color: '#22c55e',
                  background: 'rgba(34,197,94,0.15)',
                  padding: '2px 6px',
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'inline-block',
                    boxShadow: '0 0 6px #22c55e',
                  }}
                />
                Live
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 2 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)', flexShrink: 0 }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={siteDisplayName}
                >
                  {siteDisplayName}
                </div>
                <div style={{ fontSize: 10, color: '#8a7f6c', fontFamily: 'var(--font-mono)' }}>
                  ID: {siteId}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid #332b21',
              }}
            >
              <a
                href={siteDisplayDomain}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--gold)',
                  fontSize: 11,
                  textDecoration: 'none',
                  padding: 0,
                  background: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {siteDisplayDomain.replace(/^https?:\/\//, '')} ↗
              </a>

              <button
                type="button"
                onClick={() => setSwitcherOpen(!switcherOpen)}
                style={{
                  background: switcherOpen ? 'var(--gold)' : '#332b21',
                  color: switcherOpen ? '#000' : '#cfc4ae',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  padding: '3px 8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {switcherOpen ? 'Close ▲' : 'Switch ▾'}
              </button>
            </div>

            {/* Slide-out Switcher Drawer */}
            {switcherOpen && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid #3d3428',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: '#8a7f6c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 2,
                  }}
                >
                  Select Active Store
                </div>
                {sites.map((s) => (
                  <Link
                    key={s.id}
                    href={`/sites/${s.id}`}
                    onClick={() => setSwitcherOpen(false)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: s.id === siteId ? 'rgba(166, 114, 50, 0.3)' : 'transparent',
                      color: s.id === siteId ? '#fff' : '#cfc4ae',
                      border: s.id === siteId ? '1px solid var(--gold)' : '1px solid transparent',
                    }}
                  >
                    <span style={{ fontWeight: s.id === siteId ? 600 : 400 }}>{s.name}</span>
                    <span style={{ fontSize: 10, color: '#8a7f6c' }}>
                      {s.domain.replace(/^https?:\/\//, '')}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/sites"
                  onClick={() => setSwitcherOpen(false)}
                  style={{
                    marginTop: 6,
                    padding: '6px 8px',
                    fontSize: 11,
                    color: 'var(--gold)',
                    textAlign: 'center',
                    border: '1px dashed #4a3f31',
                    borderRadius: 4,
                    background: 'transparent',
                  }}
                >
                  + Add New Store
                </Link>
              </div>
            )}
          </div>

          <nav aria-label="Site Navigation">
            {siteLinks.map(([href, label]) => {
              const isExact = pathname === href;
              const isChild = href !== `/sites/${siteId}` && pathname.startsWith(href);
              const isActive = isExact || isChild;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              margin: '16px 14px 8px',
              borderTop: '1px solid #29241d',
              paddingTop: 12,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Global Tools
          </div>

          <nav aria-label="Global Tools">
            {toolsLinks.map(([href, label]) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </>
      ) : (
        <>
          {/* Global Store Switcher Pill */}
          <div
            style={{
              background: '#241f18',
              border: '1px solid #3d3428',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#8a7f6c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Stores & Tenants
              </span>
              <button
                type="button"
                onClick={() => setSwitcherOpen(!switcherOpen)}
                style={{
                  background: switcherOpen ? 'var(--gold)' : '#332b21',
                  color: switcherOpen ? '#000' : '#cfc4ae',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  padding: '2px 6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {switcherOpen ? 'Close ▲' : 'Open ▾'}
              </button>
            </div>

            <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>
              {sites.length > 0 ? `${sites.length} Active Stores` : 'Multi-Store Engine'}
            </div>

            {switcherOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, paddingTop: 6, borderTop: '1px solid #332b21' }}>
                {sites.map((s) => (
                  <Link
                    key={s.id}
                    href={`/sites/${s.id}`}
                    onClick={() => setSwitcherOpen(false)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#cfc4ae',
                    }}
                  >
                    <span>{s.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--gold)' }}>Open →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Main Navigation">
            {mainPlatformLinks.map(([href, label]) => {
              const isActive = pathname === href || (href === '/sites' && pathname.startsWith('/sites'));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              margin: '16px 14px 8px',
              borderTop: '1px solid #29241d',
              paddingTop: 12,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Tools & Integration
          </div>

          <nav aria-label="Tools Navigation">
            {toolsLinks.map(([href, label]) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </>
      )}

      {/* Theme Toggle Slider & Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #29241d' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#0d0b08',
            padding: '3px',
            borderRadius: 20,
            border: '1px solid #262119',
          }}
        >
          <button
            type="button"
            onClick={() => toggleTheme('light')}
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: 16,
              border: 'none',
              background: themeMode === 'light' ? 'var(--gold)' : 'transparent',
              color: themeMode === 'light' ? '#000' : '#8a7f6c',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => toggleTheme('dark')}
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: 16,
              border: 'none',
              background: themeMode === 'dark' ? 'var(--gold)' : 'transparent',
              color: themeMode === 'dark' ? '#000' : '#8a7f6c',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Dark
          </button>
        </div>

        <div className="nav-meta" style={{ marginTop: 12, textAlign: 'center', fontSize: 11 }}>
          VibeGuy Platform · Port 3000
        </div>
      </div>
    </aside>
  );
}
