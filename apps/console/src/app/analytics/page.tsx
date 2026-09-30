import { computeUplift } from '@/lib/analytics';
import { ensureSchema, getDb } from '@/db';
import { campaigns, creators, events } from '@/db/schema';
import { SimulateButton } from '@/components/SimulateButton';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  await ensureSchema();
  const db = getDb();
  const uplift = await computeUplift();
  const campaignRows = await db.select().from(campaigns);
  const creatorRows = await db.select().from(creators);
  const allEvents = await db.select().from(events);

  // Per-campaign breakdown
  const breakdown = campaignRows.map((cmp) => {
    const cmpEvents = allEvents.filter((e) => e.campaignId === cmp.id);
    const personalized = cmpEvents.filter((e) => e.variant === 'personalized');
    const conversions = personalized.filter((e) => e.type === 'purchase');
    const cvr = personalized.length ? (conversions.length / personalized.length) * 100 : 0;
    const creator = creatorRows.find((c) => c.id === cmp.creatorId);
    const execMsArr = personalized.map((e) => e.execMs).filter((n): n is number => n != null);
    const p95Exec = execMsArr.length
      ? [...execMsArr].sort((a, b) => a - b)[Math.floor(execMsArr.length * 0.95)] ?? 0
      : 0;
    return { cmp, creator, personalized: personalized.length, conversions: conversions.length, cvr, p95Exec };
  });

  // Funnel counts
  const funnel = ['view', 'slot_applied', 'add_to_cart', 'checkout', 'purchase'].map((t) => ({
    type: t,
    count: allEvents.filter((e) => e.type === t && e.variant === 'personalized').length,
  }));

  return (
    <div>
      <p className="kicker">Uplift Analytics</p>
      <h1>Holdout A/B Results</h1>
      <p className="lede">
        Two-proportion z-test comparing personalized vs control groups.{' '}
        {uplift.rum.simulatedShare > 0 && (
          <span style={{ color: 'var(--muted)' }}>
            {Math.round(uplift.rum.simulatedShare * 100)}% of events are labeled simulated.
          </span>
        )}
      </p>

      <div style={{ marginBottom: 20 }}>
        <SimulateButton />
      </div>

      {/* Top stats */}
      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        <div className="card">
          <p className="kicker">Relative uplift</p>
          <div className="stat" style={{ color: uplift.stats.relativeUplift > 0 ? 'var(--ok)' : 'var(--muted)' }}>
            {uplift.stats.relativeUplift >= 0 ? '+' : ''}{(uplift.stats.relativeUplift * 100).toFixed(1)}%
          </div>
          <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--muted)' }}>
            {uplift.stats.isSignificant95 ? '✓ Significant at 95% CI' : 'Below significance threshold'}
          </p>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: 4 }}>
            z={uplift.stats.zScore.toFixed(3)} · p={uplift.stats.pValue?.toFixed(4) ?? 'N/A'}
          </p>
        </div>
        <div className="card">
          <p className="kicker">RUM p95</p>
          <div className="stat" style={{ color: uplift.rum.execMsP95 <= 50 ? 'var(--ok)' : 'var(--danger)' }}>
            {uplift.rum.execMsP95}ms
          </div>
          <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--muted)' }}>execMs p95 · Budget 50ms</p>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: 4 }}>
            CLS p95: {uplift.rum.clsP95.toFixed(3)} · G2 target &lt;0.1
          </p>
        </div>
        <div className="card">
          <p className="kicker">Visitors</p>
          <div className="stat">{uplift.variantVisitors + uplift.controlVisitors}</div>
          <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--muted)' }}>
            {uplift.variantVisitors} personalized · {uplift.controlVisitors} control
          </p>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: 4 }}>
            {uplift.variantConversions} conversions vs {uplift.controlConversions}
          </p>
        </div>
      </div>

      {/* Conversion funnel */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 12 }}>Conversion funnel (personalized)</h2>
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: '1px solid var(--rule)', borderRadius: 2, overflow: 'hidden' }}>
        {funnel.map((step, i) => {
          const pct = funnel[0].count ? Math.round((step.count / funnel[0].count) * 100) : 0;
          return (
            <div key={step.type} style={{
              flex: 1, padding: '14px 10px',
              background: i === 0 ? 'var(--paper-2)' : i % 2 ? 'var(--paper)' : 'var(--paper-2)',
              borderLeft: i > 0 ? '1px solid var(--rule)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                {step.type.replace('_', ' ')}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>{step.count}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{pct}%</div>
            </div>
          );
        })}
      </div>

      {/* Per-campaign breakdown */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 12 }}>Campaign breakdown</h2>
      <table className="table" style={{ marginBottom: 32 }}>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Creator</th>
            <th>Visitors (P)</th>
            <th>Conversions</th>
            <th>CVR</th>
            <th>execMs p95</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map(({ cmp, creator, personalized, conversions, cvr, p95Exec }) => (
            <tr key={cmp.id}>
              <td style={{ fontWeight: 600 }}>{cmp.name}</td>
              <td>{creator?.handle ?? '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{personalized}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{conversions}</td>
              <td style={{ fontFamily: 'var(--font-mono)', color: cvr > 5 ? 'var(--ok)' : 'inherit' }}>
                {cvr.toFixed(1)}%
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: p95Exec <= 50 ? 'var(--ok)' : 'var(--danger)' }}>
                {p95Exec}ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Event log */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 12 }}>
        Event log (last 40)
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Visitor</th>
              <th>Campaign</th>
              <th>Variant</th>
              <th>Type</th>
              <th>execMs</th>
              <th>Sim</th>
            </tr>
          </thead>
          <tbody>
            {uplift.log.map((ev) => (
              <tr key={ev.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ev.visitorId.slice(0, 14)}…</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ev.campaignId}</td>
                <td>
                  <span style={{
                    fontSize: 10, padding: '1px 5px', borderRadius: 999,
                    background: ev.variant === 'personalized' ? 'var(--gold)' : 'var(--muted)',
                    color: ev.variant === 'personalized' ? '#14110b' : '#fff',
                    fontFamily: 'var(--font-mono)',
                  }}>{ev.variant.slice(0, 4)}</span>
                </td>
                <td style={{ fontSize: 12 }}>{ev.type}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ev.execMs ?? '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                  {ev.simulated ? 'sim' : ''}
                </td>
              </tr>
            ))}
            {uplift.log.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>
                No events yet. Click "Simulate traffic" above.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
