# Project State

Current production-state summary. Keep this file short and factual.

## Current Truth

- Project: `browserscan.org`
- Platform: Cloudflare Workers
- Production web: `https://browserscan.org`
- Production API: `https://api.browserscan.org`
- API Worker: `browserscan-network-injector` at version `ef6ac11b-9ae8-4735-9955-8dca5b058b2a`
- Web Worker: `web` at version `b97a2390-f787-488a-9f21-44bbcadb5257`
- Cloudflare account alias: `jessgaojia`
- OpenClaw project: `oc-browserscan.org-1def7956`
- Last known good: `2026-07-18T09:46:35Z`

## Latest Validation

- Worker and OpenNext release builds passed on OpenClaw.
- `8.8.8.8` returned Google / AS15169 with IPBot fraud score `12`.
- Worker logs confirmed IPBot Pro rate-limit telemetry (`tier=pro`, limit `600`).
- Desktop and mobile Chromium completed the live production scan flow.
- Production IP Lookup UI returned the expected `8.8.8.8` result.

## Known Warnings

- A new browser with no stored scan receives an expected `404` from `/api/scan/latest`; the UI presents a truthful empty/error state and can start a live scan.
- Chromium reports the Web Audio `ScriptProcessorNode` deprecation warning.
- The deployed source tree was dirty at Git commit `de564b51e150`; use the deploy ledger and Worker version IDs as the exact release record.

## Status Rule

Authentication failure only means a new direct deployment cannot run. Confirm
production state from this file, `ops/current-state.json`,
`ops/deploy-ledger.jsonl`, the public URLs, and Cloudflare Worker versions.
