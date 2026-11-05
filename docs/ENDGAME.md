# ENDGAME — One-Way Doors

Surfaces here are hard or impossible to reverse once live: public URLs, API
response shapes, stored data shapes/IDs, and the public read path. Changing any
of them can break external links, cached edge responses, or existing D1 rows.
Treat every change below as requiring a deliberate decision and, where data
already exists in production D1, a redesign rather than a destructive migration.

## Public URLs (do not rename or remove)

- Site routes: `/`, `/tools/*`, `/knowledge/*`, `/report/*`, `/simulation/*`.
- API (worker, `api.browserscan.org`):
  - `POST /api/scan/start`, `POST /api/scan/collect`
  - `GET  /api/scan/:id`, `GET /api/scan/latest`
  - `POST /api/scan/:id/pdf`
  - `POST /api/tools/ip-lookup`, `/api/tools/port-scan`, `/api/tools/leak-test`, `/api/tools/webrtc-check`, `/api/tools/turnstile-verify`
  - `POST /api/simulation/recaptcha`, `/api/simulation/behavior`, `GET /api/simulation/behavior/history`
  - `POST /api/ai/chat`, `GET /api/health`

Renaming or deleting any of these is a breaking change. Keep the path and change
behavior behind it instead.

## API response shape (stable contract)

- Success envelope: `{ "status": "ok", "data": <payload> }`.
- Error envelope: `{ "status": "error", "message": string }` (AI chat uses
  `{ "status": "error", "error": { code, message } }`).
- `ScanReport` (in `packages/types`) is the stored and returned report shape.
  Adding **optional** fields is safe. Removing or renaming fields, or changing a
  field's type, breaks older stored `report_blob` rows and clients — redesign,
  don't mutate.

## Stored data shape / IDs (D1 holds production data)

- `scans.id` is a client-generated UUID and is the public report identifier.
- `scans.report_blob` is a JSON string of `ScanReport`. Readers must tolerate
  older blobs missing newer optional fields.
- Table columns in `drizzle/schema.sql` are additive-only in practice: new
  columns must be nullable / defaulted; never drop or retype a populated column.
- `ip_hash` columns use a per-feature salt; changing a salt invalidates existing
  history lookups.

## Public read path (privacy-critical)

- `GET /api/scan/:id` and `GET /api/scan/latest` are unauthenticated public
  reads that return a full `ScanReport` including the scanned client's IP,
  geolocation and fingerprint.
- `:id` is keyed by an unguessable UUID; `latest` MUST be scoped to the
  requesting client so it never returns another visitor's report.
- Because these responses contain per-visitor PII, they must not be stored in
  shared/edge caches: use `Cache-Control: private` (and `no-store` for
  `latest`). Do not re-introduce `public`/`s-maxage` on these routes.

## Change procedure

1. If a change touches anything above, state the decision and the migration
   impact in the PR/commit before shipping.
2. Prefer additive, backward-compatible changes. For report shape, add optional
   fields only.
3. Never run a destructive D1 migration on a populated table. Add nullable
   columns; backfill with a reversible script.
4. Verify with real browser QA on the OpenClaw lane before any production deploy.
