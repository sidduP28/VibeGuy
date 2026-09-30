import { ensureSchema, getDb } from '@/db';
import { sites } from '@/db/schema';
import { InstallerTabs } from '@/components/InstallerTabs';

export const dynamic = 'force-dynamic';

export default async function InstallerPage() {
  await ensureSchema();
  const db = getDb();
  const site = (await db.select().from(sites))[0];

  return (
    <div>
      <p className="kicker">Installer Hub</p>
      <h1>One-tag Install</h1>
      <p className="lede">
        Drop a single <code>&lt;script&gt;</code> tag in your <code>&lt;head&gt;</code>.
        The SDK ({`<`}3KB gzip) loads zero dependencies, runs in under 50ms, and swaps slots before first paint — 0 CLS.
      </p>
      <div className="row" style={{ marginBottom: 24 }}>
        <span className="pill">Site: {site?.id ?? 'site_demo'}</span>
        <span className="pill" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>pk: {site?.publicKey ?? '—'}</span>
        <span className="pill" style={{ color: site?.killSwitch ? 'var(--danger)' : 'var(--ok)' }}>
          Kill switch {site?.killSwitch ? 'ON' : 'OFF'}
        </span>
      </div>
      <InstallerTabs siteId={site?.id ?? 'site_demo'} />
    </div>
  );
}
