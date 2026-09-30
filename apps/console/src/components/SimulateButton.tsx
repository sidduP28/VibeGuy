'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SimulateButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const router = useRouter();

  async function simulate() {
    setLoading(true);
    const res = await fetch('/api/simulate', { method: 'POST' });
    const data = await res.json();
    setResult(`Inserted ${data.inserted} events (${data.label})`);
    setLoading(false);
    router.refresh();
    setTimeout(() => setResult(''), 4000);
  }

  return (
    <div className="row">
      <button className="btn ghost" type="button" onClick={simulate} disabled={loading} id="simulate-btn">
        {loading ? 'Simulating…' : '⚡ Simulate traffic'}
      </button>
      {result && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{result}</span>}
    </div>
  );
}
