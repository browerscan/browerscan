# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BrowserScan.org is a browser fingerprinting and privacy analysis platform built on **Cloudflare's full stack** (Pages + Workers + D1 + R2). It provides real-time scanning, risk scoring, leak detection, and PDF report generation.

**Architecture**: Monorepo with npm workspaces
- **Frontend**: Next.js 15 App Router → Cloudflare Pages via `@opennextjs/cloudflare`
- **Backend**: Cloudflare Worker (Hono framework) → D1 database + R2 storage
- **Shared**: TypeScript types package (`@browserscan/types`)

## Workspace Structure

```
apps/web/                   # Next.js frontend (@browserscan/web)
workers/network-injector/   # Cloudflare Worker API (@browserscan/network-injector)
  src/
    worker.ts               # Main Hono app with all API routes
    services/               # scoring.ts, ip-intel.ts, fingerprint.ts, pdf.ts
packages/types/             # Shared TypeScript types (@browserscan/types)
drizzle/schema.sql          # D1 database schema
```

## Common Commands

```bash
# Development (concurrent: web + worker)
npm run dev              # http://localhost:3000 (web) + http://localhost:8787 (worker)
npm run dev:web          # Next.js only
npm run dev:worker       # Wrangler local worker only

# Build & Test
npm run build            # Build all workspaces
npm run build:web        # Build Next.js for Cloudflare Pages
npm run build:worker     # Build worker TypeScript
npm run pages:build      # Build Next.js specifically for Cloudflare Pages deployment
npm run lint             # ESLint for web app
npm run typecheck        # TypeScript validation
npm run test             # Web app tests (Vitest)
npm run test:worker      # Worker tests (Vitest)
npm run test:watch       # Worker tests in watch mode
npm run test:e2e         # Playwright E2E tests

# Deploy
npm run deploy:pages     # Deploy to Cloudflare Pages
npm run deploy:worker    # Deploy worker via wrangler
npm run tail:worker      # View worker logs (or: npx wrangler tail browserscan-network-injector)

# Database
npm run seed:d1          # Seed demo data to D1
npx wrangler d1 execute browserscan-db --command "SELECT * FROM scans LIMIT 10"
npx wrangler d1 execute browserscan-db --file=drizzle/schema.sql  # Apply schema
npx wrangler d1 execute browserscan-db --local --file=drizzle/schema.sql  # Local schema
npx wrangler d1 export browserscan-db --file backup.sql  # Export data
```

## Architecture Overview

### Scan Data Flow

1. **`POST /api/scan/start`** → Worker generates `scan_id`, stores initial record in D1, extracts Cloudflare request data (IP, country, colo, TLS version)

2. **`POST /api/scan/collect`** → Browser sends fingerprint payload (canvas, WebGL, WebRTC IPs, fonts, timezone, etc.) → Worker:
   - Looks up IP intelligence via ipinfo.io
   - Detects WebRTC/DNS leaks
   - Builds consistency checks (timezone vs IP, OS vs UA)
   - Calculates trust score (100 - deductions)
   - Stores complete `ScanReport` JSON in D1

3. **`GET /api/scan/:id`** → Returns complete report from D1
4. **`POST /api/scan/:id/pdf`** → Generates HTML report, stores in R2

### Worker Services (`workers/network-injector/src/services/`)

| Service | Purpose |
|---------|---------|
| `scoring.ts` | Deduction-based trust scoring (100 - penalties) |
| `ip-intel.ts` | ipinfo.io lookup, extracts Cloudflare request headers |
| `fingerprint.ts` | UA parsing, consistency checks, protocol fingerprints |
| `pdf.ts` | HTML report generation |

### Frontend Architecture

**Route Groups** (`apps/web/src/app/`):
- `(public)/page.tsx` - Dashboard with bento grid layout
- `(public)/report/*` - Detailed report sections
- `(public)/tools/*` - IP lookup, leak test, port scan, cookie check, PDF gen
- `(public)/simulation/*` - reCAPTCHA/Turnstile simulation pages
- `(public)/knowledge/*` - Methodology and privacy guides

**Key Hooks**:
- `useLiveReport()` - TanStack Query hook for scan polling and data management

### Type System (`packages/types/src/index.ts`)

Central type definitions shared across web + worker:
- `ScanReport` - Top-level structure containing all sections
- `ScoreCard` - Trust score (0-100), grade (A-F), verdict, deductions array
- `NetworkSection` - Risk flags, protocol fingerprints, leak telemetry
- `FingerprintSection` - Hardware (canvas, WebGL, screen) + Software (fonts, timezone, languages)
- `ConsistencySection` - Cross-validation checks

### Database Schema (`drizzle/schema.sql`)

Primary table `scans` with indexed fields: `created_at`, `trust_score`, `country_code`. Full report stored as JSON in `report_blob`.
Additional tables:
- `recaptcha_simulations` - Store reCAPTCHA simulation scores
- `behavior_sessions` - Track user behavior analysis for bot detection

### External Dependencies

- **ipinfo.io**: IP intelligence (requires `IPINFO_TOKEN` secret in worker)
- **Cloudflare Turnstile**: Bot verification
- **R2 Storage**: PDF report storage in `browserscan-reports` bucket

## Development Workflow

### Adding New Features

1. **Define Types First**: Update `packages/types/src/index.ts`
2. **Worker API**: Add endpoint in `workers/network-injector/src/worker.ts`, implement service in `services/`
3. **Frontend**: Create route in `apps/web/src/app/(public)/`, components in `components/sections/`
4. **Test**: Unit tests in `__tests__/` (Vitest), E2E tests with Playwright

### Cloudflare Bindings

Worker bindings defined in `workers/network-injector/wrangler.toml`:
- `DB` - D1 database (`browserscan-db`)
- `REPORTS_BUCKET` - R2 bucket (`browserscan-reports`)
- `IPINFO_TOKEN` - Secret for IP intelligence API

Access in worker: `c.env.DB`, `c.env.REPORTS_BUCKET`
Access in Next.js: `getCloudflareContext()` (via `@opennextjs/cloudflare`)

### Design System (`docs/DESIGN_SYSTEM.md`)

- **Colors**: Zinc (bg/text), Emerald (safe), Rose (risk), Amber (warn), Sky (info)
- **Typography**: Geist Sans (UI), Geist Mono (data/code)
- **Layout**: Bento Grid with `col-span` variants
- **Components**: HealthRing, StatusDot, KeyValueCard, ScanConsole

### CI/CD (`.github/workflows/`)

- **ci.yml**: Lint, typecheck, unit tests, build, Playwright E2E on push/PR
- **deploy-pages.yml**: Build and deploy to Cloudflare Pages on main branch
- **deploy-worker.yml**: Deploy worker via wrangler

## Important Notes

- **Workspace dependencies**: `@browserscan/types` uses `file:` protocol
- **Worker name**: `browserscan-network-injector`
- **Sample data**: Falls back to `sampleReport` when D1 is empty
- **Local D1**: `wrangler dev --local` creates local SQLite instance
- **Version Requirements**: This project uses Next.js 16.0.7 and React 19.2.1 (upgraded per standards)
- **Environment Setup**: Copy `.env.example` to `.env.local` for local development (never commit)
- **Required Secrets**: `IPINFO_TOKEN`, `TURNSTILE_SECRET_KEY`, `PDF_SIGNING_KEY` in worker
