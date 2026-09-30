# VibeGuy: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship VibeGuy end-to-end: a high-performance creator personalization platform featuring a zero-latency in-head SDK (<3KB gzip, <50ms CPU, 0 CLS), full Marketer Console (Campaign Builder, Theme Lab, VibeDNA, Uplift Analytics with two-proportion z-test, VibePilot, Reference Extractor), React and Edge adapters, 3 realistic demo stores, and comprehensive automated test/benchmark gates.

**Architecture:** Monorepo with `packages/core` (logic, schemas, security, stats), `packages/sdk` (zero-dependency IIFE engine), `packages/react` (@vibe/react provider & slots), `packages/edge` (Cloudflare HTMLRewriter engine), `apps/console` (Next.js 15, Drizzle ORM, libSQL/Turso, Tailwind, shadcn), and `demo-stores` (Shopify, Webflow, Next.js).

**Tech Stack:** TypeScript, Next.js 15 (App Router), Drizzle ORM, libSQL, Tailwind CSS, tsup, Vitest, Playwright, Autocannon.

**Spec:** [docs/DESIGN.md](file:///c:/Users/Anjani%20Siddartha/Documents/PROJECTS/project/docs/DESIGN.md)

---

## Global Constraints
- SDK runtime bundle MUST be <= 3KB gzipped with 0 external dependencies (G1).
- Script CPU execution time from trigger to applied MUST be <= 50ms p95 under 4x CPU throttle (G1).
- Cumulative Layout Shift (CLS) on personalized pages MUST be < 0.1 (target 0.000) (G2).
- Pre-hide styles must ONLY use `visibility: hidden` on slots and clear within 300ms fail-safe (G2, G3).
- SEO properties (title, meta, canonical URL, structured data) MUST NEVER be modified (G4).
- Text updates MUST use `textContent` exclusively (no `innerHTML` or `eval`) (G5).
- All external server-side fetches MUST pass through the SSRF guard blocking loopback, private CIDRs, and DNS rebinding (G5).
- All numbers shown in UI or reports MUST come from real execution or be labeled "simulated".

---

## Review Focus
1. **SSRF Guard with DNS Rebinding:** Ensure hostnames resolving to private IPs (`127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`) are blocked before and after redirect.
2. **Deterministic Holdout Hash Distribution:** Ensure `hash(visitorId, campaignId)` is consistently distributed across buckets so control groups accurately receive unpersonalized pages.
3. **Graceful Fallback & 300ms Timeout:** Ensure that network delays, malformed parameters, or unhandled exceptions immediately reveal the generic page without error leaks.
4. **Hydration Warning Safety:** Ensure `@vibe/react` eliminates DOM mismatches between SSR search parameters and client hydration.
5. **SEO & Bot User-Agent Handling:** Ensure Googlebot and search crawlers receive the clean generic page while Lighthouse receives the personalized experience for RUM audit.

---

## File Tree
```
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── vitest.config.ts
├── docs/
│   ├── DESIGN.md
│   └── PLAN.md
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── schemas.ts
│   │   │   ├── trigger.ts
│   │   │   ├── holdout.ts
│   │   │   ├── stats.ts
│   │   │   ├── ssrf.ts
│   │   │   ├── themes.ts
│   │   │   └── sanitize.ts
│   │   └── tests/
│   │       ├── trigger.test.ts
│   │       ├── holdout.test.ts
│   │       ├── stats.test.ts
│   │       ├── ssrf.test.ts
│   │       └── sanitize.test.ts
│   ├── sdk/
│   │   ├── package.json
│   │   ├── tsup.config.ts
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── prehide.ts
│   │   │   ├── slots.ts
│   │   │   ├── images.ts
│   │   │   ├── beacon.ts
│   │   │   ├── rum.ts
│   │   │   ├── debug.ts
│   │   │   └── bot.ts
│   │   └── tests/
│   │       ├── bundle.test.ts
│   │       └── sdk-runtime.test.ts
│   ├── react/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── VibeProvider.tsx
│   │   │   ├── VibeSlot.tsx
│   │   │   └── useVibe.ts
│   │   └── tests/
│   │       └── react.test.tsx
│   └── edge/
│       ├── package.json
│       ├── src/
│       │   ├── index.ts
│       │   └── rewriter.ts
│       └── tests/
│           └── edge.test.ts
├── apps/
│   └── console/
│       ├── package.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── drizzle.config.ts
│       ├── src/
│       │   ├── db/
│       │   │   ├── schema.ts
│       │   │   ├── index.ts
│       │   │   └── seed.ts
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── campaigns/
│       │   │   │   ├── page.tsx
│       │   │   │   └── new/page.tsx
│       │   │   ├── themes/page.tsx
│       │   │   ├── vibedna/page.tsx
│       │   │   ├── analytics/page.tsx
│       │   │   ├── installer/page.tsx
│       │   │   ├── pilot/page.tsx
│       │   │   ├── extractor/page.tsx
│       │   │   ├── docs/page.tsx
│       │   │   └── api/
│       │   │       ├── collect/route.ts
│       │   │       ├── sdk/[siteId]/route.ts
│       │   │       ├── px/route.ts
│       │   │       ├── extract/product/route.ts
│       │   │       ├── extract/vibe/route.ts
│       │   │       ├── pilot/insights/route.ts
│       │   │       └── simulate/route.ts
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── Navigation.tsx
│       │   │   ├── CampaignBuilder.tsx
│       │   │   ├── SplitPreview.tsx
│       │   │   ├── ThemeLab.tsx
│       │   │   ├── ContrastChecker.tsx
│       │   │   ├── UpliftStats.tsx
│       │   │   ├── PerformanceBudgetPanel.tsx
│       │   │   ├── VibeDNAEditor.tsx
│       │   │   ├── VibePilotBoard.tsx
│       │   │   └── GuidedDemoModal.tsx
│       │   └── lib/
│       │       └── utils.ts
│       └── tests/
│           ├── api.test.ts
│           └── db.test.ts
├── demo-stores/
│   ├── shopify/
│   │   ├── index.html
│   │   └── style.css
│   ├── webflow/
│   │   ├── index.html
│   │   └── style.css
│   └── nextjs/
│       ├── package.json
│       ├── next.config.ts
│       └── src/app/page.tsx
├── benchmarks/
│   ├── run-benchmarks.ts
│   └── load-test.ts
└── tests/
    └── e2e/
        ├── personalization.spec.ts
        ├── guardrails.spec.ts
        └── demo-stores.spec.ts
```

---

## Phase 1: Workspace Scaffolding & Core Architecture (`packages/core`)
**Acceptance Test:** `pnpm test --filter @vibe/core` passes 100% of unit tests verifying trigger matching, deterministic holdout hashing, two-proportion z-test math, SSRF IP blocking, and URL sanitization.

### Task 1.1: Root Workspace & Monorepo Setup
- [x] Create `pnpm-workspace.yaml`, root `package.json`, `.gitignore`, `tsconfig.base.json`, `vitest.config.ts`.
- [x] Configure TypeScript references and scripts (`build`, `test`, `lint`).
- [x] Commit: `chore: initialize monorepo structure and workspace config`

### Task 1.2: Core Domain Logic & Security Implementations
- [x] Create `packages/core/package.json` and `packages/core/tsconfig.json`.
- [x] Implement `packages/core/src/types.ts`: site, creator, campaign, event, theme tokens, slot mapping interfaces.
- [x] Implement `packages/core/src/schemas.ts`: Zod validation schemas for all inputs and API payloads.
- [x] Implement `packages/core/src/trigger.ts`: parse URL search params (vibe code, utm_source, utm_campaign) and referrer rules with strict precedence.
- [x] Implement `packages/core/src/holdout.ts`: deterministic FNV-1a / Murmur hashing algorithm for `(visitorId, campaignId)` mapped to holdout percentage.
- [x] Implement `packages/core/src/stats.ts`: two-proportion z-test, p-value calculation, 95% confidence intervals for uplift.
- [x] Implement `packages/core/src/ssrf.ts`: IP validator blocking private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, fc00::/7) with DNS resolution checking.
- [x] Implement `packages/core/src/themes.ts`: 8 predefined token themes and WCAG AA contrast ratio calculation.
- [x] Implement `packages/core/src/sanitize.ts`: secure URL parser allowing only `https://` protocols.
- [x] Create comprehensive tests in `packages/core/tests/`.
- [x] Run: `pnpm --filter @vibe/core test` -> verify all pass.
- [x] Commit: `feat(core): implement core domain models, triggers, holdout, z-test, and ssrf guard`

---

## Phase 2: Ultra-Fast In-Head SDK Engine (`packages/sdk`)
**Acceptance Test:** `pnpm --filter @vibe/sdk test` passes bundle size gate (< 3KB gzipped) and verifies synchronous slot injection, zero layout shift image decoding, 300ms fallback timer, and bot user-agent bypassing.

### Task 2.1: SDK Modules Implementation
- [x] Implement `packages/sdk/src/prehide.ts`: injects minimal `<style>` hiding only `[data-vibe-slot]` if a trigger is detected.
- [x] Implement `packages/sdk/src/slots.ts`: MutationObserver-driven slot updater setting `textContent` only; immediately unhides applied slots.
- [x] Implement `packages/sdk/src/images.ts`: image swapping using `new Image().decode()` preserving aspect-ratio container with dominant-color placeholder.
- [x] Implement `packages/sdk/src/bot.ts`: regex bot detection bypassing crawlers (Googlebot, Bingbot) while preserving Chrome-Lighthouse.
- [x] Implement `packages/sdk/src/rum.ts`: PerformanceObserver tracking CLS, LCP, hideMs, execMs.
- [x] Implement `packages/sdk/src/beacon.ts`: batched `navigator.sendBeacon` and `/px.gif` image ping tracker.
- [x] Implement `packages/sdk/src/debug.ts`: `window.vibe.debug()` highlighting slots and printing diagnostic summary.
- [x] Implement `packages/sdk/src/index.ts`: entry point orchestrating trigger parsing, holdout check, 300ms fail-safe fallback, and RUM reporting.

### Task 2.2: SDK Bundling & Size Budget Test
- [x] Configure `packages/sdk/tsup.config.ts` for standalone minified IIFE output.
- [x] Write `packages/sdk/tests/bundle.test.ts` to assert gzipped size is strictly < 3072 bytes (3KB).
- [x] Write `packages/sdk/tests/sdk-runtime.test.ts` verifying slot updates, timeout fallback, and safe error boundaries.
- [x] Run build and test: `pnpm --filter @vibe/sdk build && pnpm --filter @vibe/sdk test`.
- [x] Commit: `feat(sdk): build zero-dependency high-performance in-head personalization sdk`

---

## Phase 3: React SDK & Edge Adapter (`packages/react`, `packages/edge`)
**Acceptance Test:** React components render without hydration errors, and the Edge Worker transforms HTML synchronously via Cloudflare HTMLRewriter.

### Task 3.1: `@vibe/react` Library
- [x] Implement `packages/react/src/VibeProvider.tsx`: React context for server and client state.
- [x] Implement `packages/react/src/VibeSlot.tsx`: slot wrapper rendering fallback and smoothly updating with personalized content.
- [x] Implement `packages/react/src/useVibe.ts`: hook accessing active campaign, creator profile, and track method.
- [x] Add tests in `packages/react/tests/react.test.tsx` verifying SSR searchParams matching and slot swapping.
- [x] Commit: `feat(react): build @vibe/react provider and slot components`

### Task 3.2: Edge Worker Engine (`packages/edge`)
- [x] Implement Cloudflare Worker with HTMLRewriter transforming HTML on the fly.
- [x] Sets `<html data-vibe-ssr="1">` to signal client SDK to bypass DOM operations.
- [x] Add tests in `packages/edge/tests/edge.test.ts`.
- [x] Commit: `feat(edge): build cloudflare worker htmlrewriter adapter`

---

## Phase 4: Database Layer & Backend APIs (`apps/console`)
**Acceptance Test:** Drizzle schema migrates to libSQL local DB, seed script populates 3 creators, `/api/collect` ingests events, and `/api/sdk/[siteId]` compiles the personalized bundle.

### Task 4.1: Database Schema & Seed Data
- [x] Setup Drizzle ORM with `@libsql/client` in `apps/console/src/db/`.
- [x] Define schemas: `sites`, `creators`, `testimonials`, `themes`, `campaigns`, `campaign_versions`, `reference_sites`, `events`, `recommendations`.
- [x] Implement `seed.ts`: populate Site, 3 creators (Fitness, Minimalist, Luxury), pre-approved testimonials, product bundles, and default campaigns.
- [x] Run migration and seed. Verify database content.
- [x] Commit: `feat(db): configure drizzle schema and seed 3 creator profiles`

### Task 4.2: Backend API Routes
- [x] Implement `/api/collect`: validates origin, site public key, rates, and persists beacon events.
- [x] Implement `/api/sdk/[siteId]`: dynamically compiles active campaigns into cached IIFE JS bundle with stale-while-revalidate headers.
- [x] Implement `/api/px`: 1x1 transparent GIF tracking endpoint for scriptless checkouts.
- [x] Implement `/api/extract/product`: SSRF-safe OG & JSON-LD metadata extractor.
- [x] Implement `/api/extract/vibe`: SSRF-safe reference style extractor (palette, fonts, CTA styles, copy tone).
- [x] Implement `/api/pilot/insights`: rule-based recommendation engine for campaigns.
- [x] Implement `/api/simulate`: generates synthetic traffic events marked `simulated=true`.
- [x] Test API routes with Vitest in `apps/console/tests/api.test.ts`.
- [x] Commit: `feat(api): implement ingest, sdk bundle compilation, extractor, and pilot apis`

---

## Phase 5: Marketer Console Frontend UI (`apps/console`)
**Acceptance Test:** All 6 P0 console screens and P1 features render with sleek, non-templated UI, light/dark mode, WCAG AA compliance, and full keyboard navigation.

### Task 5.1: Navigation, Design System & Theme Lab (P0)
- [x] Create layout with modern aesthetic: typography, sidebar, status pill, theme toggle.
- [x] Implement Theme Lab (`/themes`): 8 token themes, side-by-side comparison, visual diff table, WCAG AA contrast check and auto-repair button.
- [x] Commit: `feat(console): implement design system, shell, and theme lab with contrast validator`

### Task 5.2: Campaign Builder & Split-Screen Studio (P0)
- [x] Implement Campaign Builder (`/campaigns/new` & `/campaigns/[id]`):
  - Creator picker, product URL auto-fill, promo code, offer text, CTA, hero image, headline, subheadline, testimonial picker, holdout slider.
  - Live split-screen preview: Generic vs Personalized with desktop/mobile viewports and live execMs/CLS badges.
  - Link generator: generates UTM link, vibe short code, SVG QR code, copy button, "Open in demo store".
  - One-click version rollback.
- [x] Commit: `feat(console): implement campaign builder with split preview and link generator`

### Task 5.3: VibeDNA Hub, Analytics & Installer (P0)
- [x] Implement VibeDNA Hub (`/vibedna`): creator profiles CRUD, tone, aesthetic, approved testimonials, hero banners, brand voice, JSON export.
- [x] Implement Analytics (`/analytics`): conversion funnel, creator breakdown, transaction log, CSV export, Performance Budget panel, and Holdout Uplift card with two-proportion z-test confidence interval.
- [x] Implement Installer Hub (`/installer`): one-tag snippet with tabs for Shopify, Webflow, React/Next.js.
- [x] Implement Safety & Demo controls: kill switch, pause/expiry, "Simulate Traffic" button.
- [x] Commit: `feat(console): implement vibedna hub, analytics with z-test, and installer hub`

### Task 5.4: Vibe Extractor & VibePilot AI Recommendations (P1)
- [x] Implement Reference Board (`/extractor`): paste URLs, show extracted palette, fonts, style card, and "Blend into theme" action.
- [x] Implement VibePilot Board (`/pilot`): recommendation cards (headline CTR, offer type, theme affinity) with Approve / Reject / Create A/B test split.
- [x] Implement Guided 90-second Demo Modal.
- [x] Commit: `feat(console): implement vibe extractor, vibepilot recommendations, and guided demo`

---

## Phase 6: Realistic Storefronts (`demo-stores/*`)
**Acceptance Test:** All 3 storefronts render realistic landing pages and execute personalization upon receiving creator UTM or vibe parameters.

### Task 6.1: Shopify-Style Storefront (`demo-stores/shopify`)
- [x] Create realistic e-commerce product landing page with liquid-like layout, header, hero slot, headline slot, testimonial slot, bundle slot, offer slot, discount banner.
- [x] Include script tag loading the local SDK bundle.

### Task 6.2: Webflow-Style Landing Page (`demo-stores/webflow`)
- [x] Create modern agency/creator brand page with Webflow-style CSS classes and `data-vibe-slot` tags.

### Task 6.3: Next.js Storefront (`demo-stores/nextjs`)
- [x] Create Next.js App Router store utilizing `@vibe/react`. Server-renders initial profile from searchParams to guarantee 0 hydration mismatch.
- [x] Commit: `feat(demo): build realistic shopify, webflow, and next.js storefronts`

---

## Phase 7: Verification, Benchmarks & Quality Gates
**Acceptance Test:** Playwright E2E suite passes 100%, execution benchmark confirms <= 50ms p95 under 4x CPU throttle, bundle size <= 3KB gzip, and Lighthouse CI proves 0 layout shift with personalization applied.

### Task 7.1: Playwright End-to-End Test Suite
- [x] Write `tests/e2e/personalization.spec.ts`: create campaign -> copy link -> visit storefront -> verify all slots swap.
- [x] Write `tests/e2e/guardrails.spec.ts`: test G1 (execMs <= 50ms), G2 (CLS < 0.1), G3 (fallback on 300ms/bad param/kill switch), G4 (canonical/meta unchanged, bots pass through), G5 (textContent only, SSRF guard).
- [x] Write `tests/e2e/demo-stores.spec.ts`: verify all 3 stores adapt to creator params and Next.js has zero hydration warnings.

### Task 7.2: Benchmarks & Load Testing
- [x] Write `benchmarks/run-benchmarks.ts`: runs 200 iterations under normal and 4x CPU throttle, reporting median and p95 execMs, plus gzip bundle size.
- [x] Write `benchmarks/load-test.ts`: runs autocannon load test against `/api/sdk/[siteId]` and `/api/collect`.
- [x] Configure GitHub Actions workflow `.github/workflows/ci.yml`.

### Task 7.3: Documentation & Final Evidence Audit
- [x] Fill README.md with Mermaid architecture diagrams, guardrail evidence table, setup instructions, deploy instructions, and measured performance metrics.
- [x] Print final verification checklist.
