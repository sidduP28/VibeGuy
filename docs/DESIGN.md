# VibePersonalize: System Architecture & Design Specification
**Topic #13: AI-Powered Dynamic Landing Page Personalizer | Hackzen 2026**

## 1. Executive Summary & Intent
VibePersonalize solves the creator-to-commerce bounce crisis. Generic landing pages break emotional continuity when creator traffic lands. VibePersonalize bridges this with:
1. **Ultra-lightweight Zero-Latency In-Head SDK (<3KB gzip, <50ms CPU)**: Synchronously parses triggers (vibe param > UTM > referrer), matches baked-in creator profiles, swaps verified slots with zero CLS, and reports RUM telemetry.
2. **Marketer Control Console**: Next.js App Router workspace with Campaign Builder, Theme Lab (8+ WCAG AA-verified token themes), VibeDNA asset libraries, Reference Extractor, VibePilot recommendations, and a Holdout Uplift statistical engine (two-proportion z-test).
3. **Omni-Platform Runtime**: Support for Shopify, Webflow, and React/Next.js (@vibe/react), plus Edge Personalization via Cloudflare HTMLRewriter.

---

## 2. System Architecture & Component Topology
```
                  [ Creator Traffic / UTM / Referer / ?vibe= ]
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
   [ Edge Worker (CF HTMLRewriter) ]                 [ Browser Head Script ]
   • Checks Bot UA (passes bots clean)              • Synchronous Head IIFE (<3KB gzip)
   • Injects profile & swaps slots SSR              • Evaluates Trigger -> Holdout Hash
   • Emits <html data-vibe-ssr="1">                  • Pre-hides [data-vibe-slot] (visibility only)
           │                                         • Mutates slots on DOMContentLoaded/MO
           └─────────────────────────┬────────────────────────┘
                                     ▼
                   [ Host Landing Page (Shopify / Webflow / Next.js) ]
                   • Hero, Headline, Subheadline, CTA, Bundle, Offer, Testimonial
                   • Zero CLS (Image decode before swap, aspect ratio locked)
                   • Fallback timer (300ms hard ceiling, unhides if timeout/error)
                                     │
                 Attribution Beacon (sendBeacon / /px.gif)
                                     ▼
                    [ /api/collect (Ingestion Pipeline) ]
                    • Validates Site Key, Origin allowlist, Rate-limited
                    • Persists to libSQL / Turso via Drizzle ORM
                                     ▼
                 [ Marketer Console & Analytics Engine ]
   • Campaign Studio (Split Preview, QR, Rollback)
   • Theme Lab (8+ themes, WCAG AA repair, side-by-side diff)
   • VibeDNA Profile Hub & Testimonial Library
   • Uplift Dashboard (Two-proportion z-test, Funnel, RUM budgets)
   • VibePilot Rules + Reference Site Style Extractor (SSRF-guarded)
```

---

## 3. Core Modules & Data Contracts
- **VibePersonalize Core (`packages/core`)**: Shared types, Zod schemas, FNV-1a holdout hashing, two-proportion z-test confidence intervals, and strict SSRF-safe URL fetchers.
- **Engine SDK (`packages/sdk`)**: Self-contained IIFE bundle served at `/sdk/{siteId}.js`. Compiles site-specific active campaigns directly into payload with stale-while-revalidate caching. Zero external network requests needed before first paint.
- **React Adapter (`packages/react`)**: `@vibe/react` providing `VibeProvider`, `VibeSlot`, `useVibe` hooks to ensure full React virtual DOM ownership without hydration mismatches.
- **Console Application (`apps/console`)**: Next.js 15 App Router app with libSQL/Turso Drizzle ORM, high-density dark-mode analytics, split-screen campaign playground, and installer snippets.

---

## 4. Guardrails Implementation Spec
- **G1 Performance**: IIFE compiled with tsup (minified & brotli/gzip < 3KB). Performance marks (`vibe:start`, `vibe:trigger`, `vibe:applied`) measured in browser; p95 execution budget <= 50ms verified under 4x CPU throttle.
- **G2 No Layout Shift**: Pre-hide uses `visibility: hidden` only (no `display: none`). Image slots swap only after `img.decode()` succeeds inside a CSS `aspect-ratio` box with dominant-color backdrop. CLS budget < 0.1 (target 0.000).
- **G3 Graceful Fallback**: 300ms fail-safe timer. Any exception or mismatch immediately clears hiding classes, restores baseline HTML, logs reason (`timeout`, `invalid_param`, `bot`, `holdout`, `kill_switch`), and exits cleanly.
- **G4 SEO Neutrality**: Ignores `document.title`, `<meta>`, `<link rel="canonical">`, and structured data. Search crawlers detected via regex bypass personalization entirely; Lighthouse is preserved.
- **G5 Security**: 100% `textContent` assignments (zero `innerHTML` or `eval`). Strict URL regex `^https://`. SSRF guard blocks DNS rebinding, private CIDR blocks (`10/8, 172.16/12, 192.168/16, 127/8, 169.254/16`), restricts redirect counts, enforces 5s timeouts and 2MB payload caps.
