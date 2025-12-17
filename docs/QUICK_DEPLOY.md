# Quick Deploy Guide

This guide provides a streamlined path to deploying BrowserScan.org to Cloudflare.

## Prerequisites

- GitHub repository: `https://github.com/browerscan/browerscan`
- Cloudflare account with:
  - Account ID: `YOUR_CLOUDFLARE_ACCOUNT_ID`
  - API Token created (see below)
- Node.js 20+ installed locally

## Step 1: Create Cloudflare API Token

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Select **Edit Cloudflare Workers** template
5. Add these additional permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **D1** → **Edit**
6. Click **Continue to summary** → **Create Token**
7. **Copy the token immediately** (starts with something like `u2v_...`)
8. Save it somewhere secure - you'll need it in Step 2

## Step 2: Configure GitHub Secrets

1. Go to your repository: `https://github.com/browerscan/browerscan`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these **Repository secrets**:

   | Name | Value | Description |
   |------|-------|-------------|
   | `CLOUDFLARE_API_TOKEN` | Your API token from Step 1 | Required for deployment |
   | `CLOUDFLARE_ACCOUNT_ID` | `YOUR_CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account |

4. Switch to the **Variables** tab and add:

   | Name | Value | Description |
   |------|-------|-------------|
   | `NEXT_PUBLIC_SITE_URL` | `https://browserscan.org` | Production URL |
   | `NEXT_PUBLIC_WORKER_ORIGIN` | Your worker URL | e.g., `https://browserscan-network-injector.<subdomain>.workers.dev` |

## Step 3: Set Up Cloudflare Resources

### Create D1 Database

```bash
# Already exists with ID: YOUR_D1_DATABASE_ID
# Verify it exists:
npx wrangler d1 list

# Apply schema if needed:
npx wrangler d1 execute browserscan-db --file=drizzle/schema.sql
```

### Create R2 Bucket (Optional - for PDF reports)

```bash
# Create bucket
npx wrangler r2 bucket create browserscan-reports

# Update wrangler.toml to uncomment R2 binding
```

### Create KV Namespaces (for rate limiting & caching)

```bash
# Rate limiting KV
npx wrangler kv:namespace create "RATE_LIMIT_KV" --preview false

# IP info cache KV
npx wrangler kv:namespace create "IPINFO_CACHE_KV" --preview false

# Update wrangler.toml with the returned IDs
```

## Step 4: Deploy via GitHub Actions

### Automatic Deployment (Recommended)

Push to the `main` branch:

```bash
git add .
git commit -m "chore: trigger deployment"
git push origin main
```

The workflow will automatically:
1. ✅ Run quality checks (lint, typecheck, tests)
2. 🚀 Deploy Worker to Cloudflare
3. 🚀 Deploy Pages to Cloudflare
4. ✅ Validate deployment

Watch progress at: `https://github.com/browerscan/browerscan/actions`

### Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Install dependencies
npm install

# Build and deploy worker
npm run build:worker
npm run deploy:worker

# Build and deploy pages
npm run pages:build
cd apps/web && npx opennextjs-cloudflare deploy
```

## Step 5: Configure Custom Domain (Optional)

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Select your Pages project
3. Go to **Custom domains** → **Set up a custom domain**
4. Add `browserscan.org` and `www.browserscan.org`
5. Cloudflare will automatically configure DNS

For the Worker API:
1. Go to your Worker settings
2. Add route: `api.browserscan.org/*`
3. Update `NEXT_PUBLIC_WORKER_ORIGIN` variable to `https://api.browserscan.org`

## Step 6: Add Secrets to Worker

Some features require additional secrets:

```bash
# IP intelligence API token (from ipinfo.io)
npx wrangler secret put IPINFO_TOKEN

# Cloudflare Turnstile secret key
npx wrangler secret put TURNSTILE_SECRET_KEY

# PDF signing key (generate a random string)
npx wrangler secret put PDF_SIGNING_KEY
```

## Verify Deployment

### Check Worker

```bash
# Test health endpoint
curl https://browserscan-network-injector.<subdomain>.workers.dev/health

# Expected response:
{"status":"ok","timestamp":"2025-12-17T..."}
```

### Check Pages

Visit: `https://<your-pages-url>.pages.dev`

Expected: Homepage loads with "Start Scan" button

### Check Full Flow

1. Click **Start Scan** on homepage
2. Wait for fingerprint collection
3. Verify trust score displays
4. Check all panels load correctly

## Troubleshooting

### "Error: Missing CLOUDFLARE_API_TOKEN"

- Verify the secret is added in GitHub Settings → Secrets and variables → Actions
- Check the name matches exactly: `CLOUDFLARE_API_TOKEN` (case-sensitive)

### "Error: Unauthorized"

- Your API token may have expired or lack permissions
- Create a new token with the required scopes (see Step 1)

### "Error: D1 database not found"

```bash
# List databases
npx wrangler d1 list

# If missing, create it
npx wrangler d1 create browserscan-db

# Update wrangler.toml with the new database_id
```

### Worker deployment succeeds but API returns 500

```bash
# Check worker logs
npx wrangler tail browserscan-network-injector

# Common issues:
# - Missing secrets (IPINFO_TOKEN, etc.)
# - D1 database not initialized
# - R2 bucket not created (if using PDF export)
```

### Pages build fails

```bash
# Test build locally first
npm run pages:build

# Common issues:
# - Missing environment variables
# - Outdated dependencies (run npm install)
# - Node version mismatch (requires Node 20+)
```

## Monitoring

### View Worker Logs

```bash
# Real-time logs
npx wrangler tail browserscan-network-injector

# View in dashboard
# Cloudflare Dashboard → Workers & Pages → browserscan-network-injector → Logs
```

### View Pages Logs

```bash
# View deployment logs
# Cloudflare Dashboard → Workers & Pages → <your-pages-project> → Deployments
```

### Check GitHub Actions

All deployment history: `https://github.com/browerscan/browerscan/actions`

## Cost Estimate (Cloudflare Free Tier)

- **Workers**: 100,000 requests/day (FREE)
- **Pages**: Unlimited requests, 500 builds/month (FREE)
- **D1**: 5GB storage, 5M reads/day (FREE)
- **R2**: 10GB storage, 1M reads/month (FREE)
- **KV**: 100,000 reads/day (FREE)

For most use cases, BrowserScan runs entirely within free tier limits.

## Next Steps

1. ✅ Set up custom domain
2. ✅ Add monitoring/alerts in Cloudflare Dashboard
3. ✅ Configure rate limiting thresholds
4. ✅ Set up analytics
5. ✅ Review privacy policy and methodology docs

## Additional Resources

- [Detailed Security Setup](./SECURITY_SETUP.md) - Comprehensive guide for configuring secrets
- [Deployment Guide](./DEPLOYMENT.md) - Full deployment documentation
- [GitHub Actions Workflow](../.github/workflows/deploy.yml) - CI/CD configuration
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare](https://opennext.js.org/cloudflare)

---

**Last Updated**: 2025-12-17
**Need Help?** Open an issue at `https://github.com/browerscan/browerscan/issues`
