# SDD ledger — plan: docs/PLAN.md

## Pre-flight
- Shared interfaces verified between packages/core, packages/sdk, packages/react, packages/edge, and apps/console.
- Strict TDD enforcement: write failing test -> verify failure -> write minimal implementation -> verify pass -> commit.

## Phase Progress
- [x] Phase 1: Workspace Scaffolding & Core Architecture (`packages/core`)
  - Tests: vitest run -> 5 files passed, 18 tests passed (holdout, sanitize, trigger, stats, ssrf).
  - Build: tsup succeeded (CJS, ESM, DTS).
- [ ] Phase 2: Ultra-Fast In-Head SDK Engine (`packages/sdk`)
- [ ] Phase 3: React SDK & Edge Adapter (`packages/react`, `packages/edge`)
- [ ] Phase 4: Database Layer & Backend APIs (`apps/console`)
- [ ] Phase 5: Marketer Console Frontend UI (`apps/console`)
- [ ] Phase 6: Realistic Storefronts (`demo-stores/*`)
- [ ] Phase 7: Verification, Benchmarks & Quality Gates
