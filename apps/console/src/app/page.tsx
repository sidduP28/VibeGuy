import { computeUplift } from '@/lib/analytics';
import { ensureSchema, getDb } from '@/db';
import { campaigns, creators, sites } from '@/db/schema';
import Link from 'next/link';
import { GuidedDemoModal } from '@/components/GuidedDemoModal';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await ensureSchema();
  const db = getDb();
  const creatorRows = await db.select().from(creators);
  const campaignRows = await db.select().from(campaigns);
  const site = (await db.select().from(sites))[0];
  const uplift = await computeUplift();
  const activeCount = campaignRows.filter((c) => c.status === 'active').length;

  return (
    <div>
      <p className="kicker">Marketer console · Hackzen 2026 Topic #13</p>
      <h1>Keep the vibe after the click.</h1>
      <p className="lede">
        Zero-latency in-head SDK (&lt;3KB gzip, &lt;50ms CPU, 0 CLS) — without touching title,
        canonical, or structured data.
      </p>

      <div className="row" style={{ marginBottom: 28 }}>
        <span className="pill" style={{ color: site?.killSwitch ? 'var(--danger)' : 'var(--ok)' }}>
          ● Kill switch {site?.killSwitch ? 'ON' : 'off'}
        </span>
        <span className="pill">{creatorRows.length} creators</span>
        <span className="pill">{activeCount} active campaigns</span>
        {uplift.rum.simulatedShare > 0 && (
          <span className="pill" style={{ color: 'var(--muted)' }}>
            {Math.round(uplift.rum.simulatedShare * 100)}% data simulated
          </span>
        )}
        <GuidedDemoModal />
      </div>

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        <div className="card">
          <p className="kicker">Holdout uplift</p>
          <div className="stat" style={{ color: uplift.stats.relativeUplift > 0 ? 'var(--ok)' : 'var(--muted)' }}>
            {uplift.stats.relativeUplift >= 0 ? '+' : ''}
            {(uplift.stats.relativeUplift * 100).toFixed(1)}%
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            {uplift.stats.isSignificant95 ? '✓ Significant at 95% CI' : 'Not yet significant'} · z={uplift.stats.zScore.toFixed(2)}
          </p>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 6, color: 'var(--muted)' }}>
            {uplift.variantVisitors} personalized · {uplift.controlVisitors} control
          </p>
        </div>
        <div className="card">
          <p className="kicker">RUM performance</p>
          <div className="stat" style={{ color: uplift.rum.execMsP95 <= 50 ? 'var(--ok)' : 'var(--danger)' }}>
            {uplift.rum.execMsP95}ms
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            execMs p95 · Budget 50ms
          </p>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 6, color: 'var(--muted)' }}>
            CLS p95: {uplift.rum.clsP95.toFixed(3)} · Target &lt;0.1
          </p>
        </div>
        <div className="card">
          <p className="kicker">Quick actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <Link className="btn gold" href="/campaigns/new">+ New campaign</Link>
            <Link className="btn ghost" href="/analytics">View uplift analytics →</Link>
            <Link className="btn ghost" href="/installer">Get install snippet →</Link>
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: 12, fontSize: '1.3rem' }}>
        Active campaigns
      </h2>
      <table className="table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Creator</th>
            <th>Theme</th>
            <th>Holdout</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {campaignRows.map((cmp) => {
            const creator = creatorRows.find((c) => c.id === cmp.creatorId);
            return (
              <tr key={cmp.id}>
                <td style={{ fontWeight: 600 }}>{cmp.name}</td>
                <td>{creator?.handle ?? cmp.creatorId}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{cmp.themeId}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{cmp.holdoutPct}%</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    background: cmp.status === 'active' ? 'var(--ok)' : 'var(--muted)',
                    color: '#fff',
                  }}>
                    {cmp.status}
                  </span>
                </td>
                <td>
                  <Link href={`/campaigns?id=${cmp.id}`} style={{ fontSize: 12, color: 'var(--gold)' }}>
                    Edit →
                  </Link>
                </td>
              </tr>
            );
          })}
          {campaignRows.length === 0 && (
            <tr><td colSpan={6} style={{ color: 'var(--muted)', textAlign: 'center', padding: 24 }}>No campaigns yet. Create one above.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
