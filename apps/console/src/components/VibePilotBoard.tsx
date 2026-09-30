'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Recommendation {
  id: string; campaignId: string; current: string; suggested: string;
  reason: string; impact: string; status: string;
}
interface Campaign { id: string; name: string; }

export function VibePilotBoard({
  recommendations,
  campaigns,
}: {
  recommendations: Recommendation[];
  campaigns: Campaign[];
}) {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(recommendations.map((r) => [r.id, r.status]))
  );
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    setStatuses((s) => ({ ...s, [id]: status }));
    await fetch('/api/pilot/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  const pending = recommendations.filter((r) => statuses[r.id] === 'pending');
  const actioned = recommendations.filter((r) => statuses[r.id] !== 'pending');

  function getCmpName(cmpId: string) {
    return campaigns.find((c) => c.id === cmpId)?.name ?? cmpId;
  }

  function RecCard({ rec }: { rec: Recommendation }) {
    const current = JSON.parse(rec.current);
    const suggested = JSON.parse(rec.suggested);
    const isActioned = statuses[rec.id] !== 'pending';
    const isApproved = statuses[rec.id] === 'approved';
    const isRejected = statuses[rec.id] === 'rejected';

    return (
      <div className="card" style={{ opacity: isActioned ? 0.65 : 1 }}>
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="pill" style={{
            fontSize: 10, fontFamily: 'var(--font-mono)',
            background: rec.impact === 'High' ? 'var(--gold)' : 'var(--muted)',
            color: '#fff', border: 'none',
          }}>{rec.impact} impact</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{getCmpName(rec.campaignId)}</span>
        </div>

        <div className="split" style={{ marginBottom: 10, fontSize: 12 }}>
          <div className="pane" style={{ background: 'var(--paper)', padding: '10px 12px', minHeight: 'auto' }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>CURRENT</p>
            {Object.entries(current).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {String(v)}</div>
            ))}
          </div>
          <div className="pane" style={{ background: 'var(--paper-2)', padding: '10px 12px', minHeight: 'auto' }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>SUGGESTED</p>
            {Object.entries(suggested).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {String(v)}</div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px', fontStyle: 'italic', lineHeight: 1.5 }}>
          {rec.reason}
        </p>

        {!isActioned ? (
          <div className="row">
            <button className="btn gold" style={{ fontSize: 12 }} onClick={() => updateStatus(rec.id, 'approved')}>
              ✓ Approve
            </button>
            <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => updateStatus(rec.id, 'rejected')}>
              ✕ Reject
            </button>
          </div>
        ) : (
          <span style={{
            fontSize: 12, fontFamily: 'var(--font-mono)',
            color: isApproved ? 'var(--ok)' : 'var(--muted)',
          }}>
            {isApproved ? '✓ Approved' : '✕ Rejected'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      {pending.length > 0 && (
        <>
          <p className="kicker" style={{ marginBottom: 12 }}>Pending review ({pending.length})</p>
          <div className="grid" style={{ gap: 12, marginBottom: 28 }}>
            {pending.map((rec) => <RecCard key={rec.id} rec={rec} />)}
          </div>
        </>
      )}
      {actioned.length > 0 && (
        <>
          <p className="kicker" style={{ marginBottom: 12 }}>Actioned ({actioned.length})</p>
          <div className="grid" style={{ gap: 12 }}>
            {actioned.map((rec) => <RecCard key={rec.id} rec={rec} />)}
          </div>
        </>
      )}
      {recommendations.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          No recommendations yet. Run some traffic and campaigns to generate insights.
        </div>
      )}
    </div>
  );
}
