import { ensureSchema, getDb } from '@/db';
import { campaigns, creators } from '@/db/schema';
import { computeUplift } from '@/lib/analytics';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  await ensureSchema();
  const db = getDb();
  const campaignRows = await db.select().from(campaigns);
  const creatorRows = await db.select().from(creators);
  const uplift = await computeUplift();

  return (
    <div>
      <p className="kicker">Campaigns</p>
      <h1>Campaign Studio</h1>
      <p className="lede">Every campaign maps one creator to one product, one theme, one holdout.</p>

      <div className="row" style={{ marginBottom: 24 }}>
        <Link className="btn gold" href="/campaigns/new">+ New campaign</Link>
        <span className="pill">{campaignRows.length} total</span>
        <span className="pill">{campaignRows.filter(c => c.status === 'active').length} active</span>
      </div>

      <div className="grid" style={{ gap: 12 }}>
        {campaignRows.map((cmp) => {
          const creator = creatorRows.find((c) => c.id === cmp.creatorId);
          return (
            <div key={cmp.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
              <div>
                <div className="row" style={{ marginBottom: 6 }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                    fontSize: 10, fontFamily: 'var(--font-mono)',
                    background: cmp.status === 'active' ? 'var(--ok)' : cmp.status === 'paused' ? 'var(--gold)' : 'var(--muted)',
                    color: '#fff',
                  }}>{cmp.status.toUpperCase()}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{cmp.themeId}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>holdout {cmp.holdoutPct}%</span>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{cmp.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                  {creator?.handle ?? cmp.creatorId} · {cmp.productTitle}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>
                  ?vibe={creator?.vibeCode ?? '—'} · utm_source={creator?.utmSource ?? '—'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Link
                  href={`/campaigns/new?id=${cmp.id}`}
                  className="btn ghost"
                  style={{ fontSize: 12, whiteSpace: 'nowrap' }}
                >
                  Edit
                </Link>
                <a
                  href={`/api/sdk/site_demo`}
                  target="_blank"
                  className="btn ghost"
                  style={{ fontSize: 12 }}
                >
                  SDK ↗
                </a>
              </div>
            </div>
          );
        })}
        {campaignRows.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
            No campaigns yet. <Link href="/campaigns/new" style={{ color: 'var(--gold)' }}>Create your first →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
