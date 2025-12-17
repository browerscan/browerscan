# BrowserScan.org Web (Next.js)

Next.js App Router front-end for BrowserScan.org, deployed via Cloudflare Pages (OpenNext). Implements the cyber-industrial design system described in `/docs`, renders dashboard/report/simulation/tooling surfaces, and consumes Worker APIs for scan data.

## Local Development

```bash
npm install
npm run dev:web
```

- Dashboard: `http://localhost:3000/`
- Deep report: `/report/*`
- Simulation lab: `/simulation/*`
- Tools: `/tools/*`
- Knowledge base: `/knowledge/*`

## Cloudflare Preview

```bash
npm run pages:build
npx wrangler pages dev .vercel/output/static
```

## Production Deploy

```bash
npm run deploy:pages
```

Refer to `/docs/DEPLOYMENT.md` for full secret management + CI steps.
