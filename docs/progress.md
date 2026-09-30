# SDD ledger — plan: docs/PLAN.md

## Pre-flight
- Shared interfaces verified between packages/core, packages/sdk, packages/react, packages/edge, and apps/console.
- Strict TDD enforcement: write failing test -> verify failure -> write minimal implementation -> verify pass -> commit.

## Phase Progress
- [x] Phase 1: Workspace Scaffolding & Core Architecture (`packages/core`)
  - Tests: vitest run -> 5 files passed, 18 tests passed (holdout, sanitize, trigger, stats, ssrf).
  - Build: tsup succeeded (CJS, ESM, DTS).
- [x] Phase 2: Ultra-Fast In-Head SDK Engine (`packages/sdk`)
  - G1 Gate: 2,834 bytes gzip (< 3072 bytes budget, 0 dependencies).
  - G2-G5 Gates: bot detection, visibility-only prehide, textContent sanitization, decode-before-reveal image swap, 300ms fail-safe fallback.
  - Tests: 7 passed.
- [x] Phase 3: React SDK & Edge Adapter (`packages/react`, `packages/edge`)
  - `@vibe/react`: VibeProvider, VibeSlot, useVibe with zero hydration mismatch.
  - `@vibe/edge`: Cloudflare & Fastly compatible HTMLRewriter with bot bypass and `<html data-vibe-ssr="1">` marking.
  - Tests: 5 passed (30 total).
- [x] Phase 4: Database Layer & Backend APIs (`apps/console`)
  - Drizzle ORM schema with libSQL/Turso: `sites`, `creators`, `testimonials`, `themes`, `campaigns`, `campaign_versions`, `reference_sites`, `events`, `recommendations`.
  - Ingestion pipeline (`/api/collect`) with public key check, origin allowlist, rate limiting, and batch insert.
  - Dynamic SDK compiler (`/api/sdk/[siteId]`) generating self-contained IIFE bundle with cache headers.
  - Transparent 1x1 GIF tracking endpoint (`/api/px`).
  - SSRF-safe style & product extractors (`/api/extract/product`, `/api/extract/vibe`).
  - Synthetic traffic generator (`/api/simulate`) with `simulated=true` attribution.
  - Tests: 15 passed across `db.test.ts` and `api.test.ts` (45 total across monorepo).
- [x] Phase 5: Marketer Console Frontend UI (`apps/console`)
  - Production build: `next build` compiled and statically generated 14 routes with 0 errors.
  - Campaign Studio (`/campaigns/new`): split-screen live preview, holdout slider, theme picker, QR code, SDK snippet preview.
  - Theme Lab (`/themes`): 8 builtin token themes, WCAG AA contrast ratio validator (pass/fail badges), CSS variable table.
  - VibeDNA Hub (`/vibedna`): multi-creator profile management, brand voice, testimonials display, JSON export.
  - Uplift Analytics (`/analytics`): real two-proportion z-test statistics, conversion funnel, RUM metrics, traffic simulation button.
  - Installer Hub (`/installer`): Shopify Liquid, Webflow, and Next.js tabs with guardrail checklist.
  - VibePilot Board (`/pilot`): rule-based AI recommendations with approve/reject workflow.
  - Extractor Playground (`/extractor`): live URL palette, font, and tone extraction with SSRF validation.
  - Interactive Guided Demo Modal and documentation (`/docs`).
- [x] Phase 6: Realistic Storefronts (`demo-stores/*`)
  - `demo-stores/shopify`: liquid-style e-commerce product landing page with approved slots.
  - `demo-stores/webflow`: creative agency brand landing page with slot markup.
  - `demo-stores/nextjs`: Next.js App Router store utilizing `@vibe/react` with `<html data-vibe-ssr="1">` zero hydration mismatch pattern.
- [x] Phase 7: Verification, Benchmarks & Quality Gates
  - Real execution benchmark runner (`benchmarks/run-benchmarks.ts`):
    - Raw Bundle: 7,302 bytes; Gzip: 2,834 bytes (< 3,072 bytes hard ceiling) -> PASS.
    - CPU Execution: p95 = 0.072 ms (< 50.000 ms budget) -> PASS.
    - Statistical Engine: z = 2.790, p = 0.00527, 95% CI = [0.90%, 5.10%], Statistically Significant -> PASS.
  - Autocannon-style load testing script (`benchmarks/load-test.ts`).
  - Playwright E2E suites: `personalization.spec.ts`, `guardrails.spec.ts`, `demo-stores.spec.ts`.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`).
  - Comprehensive documentation (`README.md`) with Mermaid diagrams and verified metrics.
