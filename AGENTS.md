# Repository Guidelines

## Project Structure & Module Organization
This npm-workspace monorepo keeps UI code in `apps/web` (Next.js App Router + Tailwind) and the edge API in `workers/network-injector` (Cloudflare Worker + Wrangler). Shared contracts/components reside in `packages/types` and `packages/ui`, while `drizzle/` defines every D1 schema and migration. Reference playbooks stay under `docs/`, and `scripts/` hosts the helper CLIs (seeds, metrics, health checks).

## Build, Test, and Development Commands
- `npm install` — installs workspace dependencies per the lockfile.
- `npm run dev` — runs the web app and worker together for realistic scan flows.
- `npm run build` — builds Pages + Worker artifacts; CI gates on this after lint/tests.
- `npm run lint && npm run typecheck` — run ESLint (browser globals) plus TypeScript checks before commits.
- `npm run test` / `npm run test:worker` — Vitest and Miniflare suites; trigger `npm run pages:build` or `npm run deploy:*` only after they pass.
- `npm run seed:d1` — seed the local D1 instance when validating reports.

## Coding Style & Naming Conventions
Write everything in TypeScript with ES modules, 2-space indentation, and prefer named exports. Components/hooks follow `PascalCase` / `useCamelCase`, utilities use `camelCase`, and packages import via `@browserscan/*` rather than deep relatives. Keep feature files under ~300 lines, colocate route code inside `apps/web/app/(pages)`, and source spacing/color tokens from `docs/DESIGN_SYSTEM.md`.

## Testing Guidelines
`apps/web` uses Vitest for units and Playwright smoke runs that cover scan → report → tools → PDF. The worker uses Miniflare integration specs for `/api/scan` plus helper routes, and CI enforces ≥80/70/70 coverage (lines/branches/functions). Name specs after the behavior (`scan-start.spec.ts`), keep fixtures next to the code they exercise, and log deferred tests inside `docs/STATUS.md`.

## Commit & Pull Request Guidelines
History shows Conventional Commit prefixes (`feat`, `fix`, `chore`), so keep using `type(scope): summary` with present-tense verbs. PRs must cite affected areas, screenshots for UX tweaks, test results, and any doc/migration updates. Secure features need two reviewers; otherwise one reviewer plus linked issues and rollout notes is sufficient.

## Security & Configuration Tips
Follow `docs/DEPLOYMENT.md` when editing `wrangler.toml`, and store secrets via `wrangler secret` + GitHub encrypted vars. Turnstile tokens, IP-intel keys, and R2 credentials belong in bindings; never hard-code them in `apps/web` bundles. Respect the privacy guardrails in `docs/ARCHITECTURE.md`: anonymize IP logs, prefer KV-cached intel lookups, and only persist PDFs to R2 when an expiring signed URL is required.
