export default function DocsPage() {
  return (
    <div>
      <p className="kicker">Documentation</p>
      <h1>VibeGuy</h1>
      <p className="lede">
        Creator-to-commerce personalization. Zero-latency in-head SDK with measurable uplift science.
      </p>

      <div className="grid grid-2" style={{ gap: 24, marginBottom: 32 }}>
        <div className="card">
          <p className="kicker">Architecture</p>
          <pre className="code" style={{ fontSize: 10, marginTop: 8 }}>{`monorepo/
├── packages/
│   ├── core/       # domain logic, schemas, stats
│   ├── sdk/        # zero-dep IIFE engine <3KB
│   ├── react/      # VibeProvider + VibeSlot
│   └── edge/       # Cloudflare HTMLRewriter
├── apps/
│   └── console/    # Next.js 15 marketer UI
└── demo-stores/    # shopify, webflow, next.js`}</pre>
        </div>
        <div className="card">
          <p className="kicker">Guardrails (G1–G5)</p>
          <ul style={{ margin: '8px 0 0', padding: '0 0 0 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong>G1:</strong> SDK ≤ 3KB gzip, ≤ 50ms CPU p95</li>
            <li><strong>G2:</strong> CLS = 0.000 (visibility:hidden only)</li>
            <li><strong>G3:</strong> 300ms fail-safe always reveals generic</li>
            <li><strong>G4:</strong> title, canonical, meta NEVER modified</li>
            <li><strong>G5:</strong> textContent only, SSRF guard on all fetches</li>
          </ul>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 12 }}>Quick start</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="kicker" style={{ marginBottom: 6 }}>1. Add slot attributes to your HTML</p>
        <pre className="code" style={{ fontSize: 11 }}>{`<h1 data-vibe-slot="headline">Default headline</h1>
<p  data-vibe-slot="subheadline">Default subheadline</p>
<a  data-vibe-slot="cta" href="/shop">Shop Now</a>
<img data-vibe-slot="hero-image" src="/default.jpg" />
<div data-vibe-slot="offer"></div>
<div data-vibe-slot="testimonial"></div>`}</pre>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="kicker" style={{ marginBottom: 6 }}>2. Drop the SDK script in &lt;head&gt;</p>
        <pre className="code" style={{ fontSize: 11 }}>{`<script src="https://your-console.vercel.app/api/sdk/site_demo" defer></script>`}</pre>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="kicker" style={{ marginBottom: 6 }}>3. Share creator links</p>
        <pre className="code" style={{ fontSize: 11 }}>{`https://your-store.com/?vibe=fit2026
https://your-store.com/?utm_source=instagram&utm_campaign=alexfit_spring`}</pre>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 12 }}>API endpoints</h2>
      <table className="table" style={{ marginBottom: 24 }}>
        <thead><tr><th>Endpoint</th><th>Method</th><th>Description</th></tr></thead>
        <tbody>
          {[
            ['GET', '/api/sdk/[siteId]', 'Compiled IIFE SDK bundle (30s CDN cache)'],
            ['POST', '/api/collect', 'Ingest beacon events (rate-limited, origin-checked)'],
            ['GET', '/api/px', '1×1 GIF tracking pixel for no-JS checkouts'],
            ['POST', '/api/extract/product', 'SSRF-safe OG meta extractor'],
            ['POST', '/api/extract/vibe', 'SSRF-safe palette + font + CTA style extractor'],
            ['GET', '/api/pilot/insights', 'Rule-based campaign recommendations'],
            ['POST', '/api/simulate', 'Generate synthetic traffic (labeled simulated)'],
            ['GET', '/api/campaigns', 'List all campaigns'],
            ['POST', '/api/campaigns', 'Create campaign'],
            ['PATCH', '/api/campaigns', 'Update status or kill switch'],
          ].map(([method, path, desc]) => (
            <tr key={path}>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{method}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{path}</td>
              <td style={{ fontSize: 13, color: 'var(--muted)' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 12 }}>Demo URLs</h2>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          ['Fitness', '?vibe=fit2026', 'var(--ok)'],
          ['Minimalist', '?vibe=minimal2026', 'var(--muted)'],
          ['Luxury', '?vibe=lux2026', 'var(--gold)'],
        ].map(([label, param, color]) => (
          <div key={label} className="card">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: color as string, marginBottom: 4 }}>{param}</p>
            <a href={`http://localhost:3001/${param}`} target="_blank" style={{ color: 'var(--gold)', fontSize: 13 }}>
              Open {label} demo →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
