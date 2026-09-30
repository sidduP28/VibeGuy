import { BUILTIN_THEMES } from '@vibe/core';

export default function ThemesPage() {
  const themes = Object.entries(BUILTIN_THEMES);

  function contrastRatio(fg: string, bg: string) {
    function lum(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const sRGB = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }
    const L1 = lum(fg.length === 4 ? `#${fg[1]}${fg[1]}${fg[2]}${fg[2]}${fg[3]}${fg[3]}` : fg);
    const L2 = lum(bg.length === 4 ? `#${bg[1]}${bg[1]}${bg[2]}${bg[2]}${bg[3]}${bg[3]}` : bg);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  function isHex(s: string) { return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s); }

  return (
    <div>
      <p className="kicker">Theme Lab</p>
      <h1>8 Token Themes</h1>
      <p className="lede">
        Each theme injects CSS custom properties via <code>document.documentElement.style.setProperty</code> — zero layout shift.
        WCAG AA requires contrast ≥ 4.5:1 for body text.
      </p>

      <div className="grid grid-2" style={{ gap: 16 }}>
        {themes.map(([id, t]) => {
          const cr = isHex(t.textColor) && isHex(t.backgroundColor)
            ? contrastRatio(t.textColor, t.backgroundColor).toFixed(2)
            : 'N/A';
          const pass = parseFloat(cr) >= 4.5;
          return (
            <div key={id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header stripe */}
              <div style={{
                background: t.backgroundColor,
                padding: '20px 20px 14px',
                borderBottom: `3px solid ${t.primaryColor}`,
              }}>
                <div style={{ color: t.textColor, fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 4 }}>
                  {t.name}
                </div>
                <div style={{ color: t.accentColor, fontSize: 12 }}>{t.fontHeading}</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                  {[t.backgroundColor, t.primaryColor, t.textColor, t.accentColor].map((col, i) => (
                    <div
                      key={i}
                      title={col}
                      style={{ width: 24, height: 24, background: col, border: '1px solid rgba(128,128,128,0.3)', borderRadius: 2 }}
                    />
                  ))}
                  <button
                    style={{
                      marginLeft: 4,
                      padding: '3px 10px',
                      background: t.primaryColor,
                      color: t.backgroundColor,
                      border: 'none',
                      borderRadius: t.borderRadius,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    CTA sample
                  </button>
                </div>
              </div>
              {/* Meta row */}
              <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                  {id}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    padding: '2px 6px', borderRadius: 999,
                    background: pass ? 'var(--ok)' : 'var(--danger)',
                    color: '#fff',
                  }}>
                    WCAG {pass ? 'AA ✓' : 'FAIL'} {cr}:1
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                    r={t.borderRadius}
                  </span>
                </div>
              </div>
              {/* Token table */}
              <div style={{ padding: '0 16px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                {[
                  ['--vibe-bg', t.backgroundColor],
                  ['--vibe-primary', t.primaryColor],
                  ['--vibe-text', t.textColor],
                  ['--vibe-accent', t.accentColor],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--rule)', padding: '3px 0' }}>
                    <span>{k}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 12, height: 12, background: v, border: '1px solid var(--rule)', display: 'inline-block', borderRadius: 1 }} />
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
