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
- [ ] Phase 4: Database Layer & Backend APIs (`apps/console`)
- [ ] Phase 5: Marketer Console Frontend UI (`apps/console`)
- [ ] Phase 6: Realistic Storefronts (`demo-stores/*`)
- [ ] Phase 7: Verification, Benchmarks & Quality Gates
