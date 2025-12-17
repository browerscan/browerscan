# BrowserScan.org Production Deployment Guide

Complete guide for deploying BrowserScan.org to Cloudflare's infrastructure (Pages + Workers + D1 + R2).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Worker Deployment](#worker-deployment)
- [Pages Deployment](#pages-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Prerequisites

### Required Accounts & Tools

1. **Cloudflare Account**
   - Free tier sufficient for testing
   - Pro/Business recommended for production
   - Access to Workers, Pages, D1, R2, and Turnstile

2. **Local Development Tools**
   ```bash
   node --version  # v20.x or higher
   npm --version   # v10.x or higher
   ```

3. **Wrangler CLI**
   ```bash
   npm install -g wrangler
   wrangler login  # Authenticate with Cloudflare
   ```

### API Keys & Tokens

Obtain these before deployment:

1. **IPInfo.io Token** (for IP intelligence)
   - Sign up at https://ipinfo.io
   - Free tier: 50,000 requests/month
   - Copy your access token

2. **Cloudflare Turnstile Keys** (for bot detection)
   - Dashboard → Turnstile → Create Site
   - Get Site Key (public) and Secret Key (private)

3. **Cloudflare API Token**
   - Dashboard → My Profile → API Tokens → Create Token
   - Template: "Edit Cloudflare Workers"
   - Permissions: Account.Cloudflare Pages:Edit, Account.Cloudflare Workers Scripts:Edit

---

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/your-org/browserscan.git
cd browserscan
npm install
```

### 2. Configure Environment Variables

#### Local Development (`.env.local`)

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WORKER_ORIGIN=http://localhost:8787
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

#### Worker Secrets (Production)

Set worker secrets via Wrangler:

```bash
cd workers/network-injector

# Set IPINFO token
wrangler secret put IPINFO_TOKEN
# Paste your IPInfo token when prompted

# Set Turnstile secret key
wrangler secret put TURNSTILE_SECRET_KEY
# Paste your Turnstile secret key

# (Optional) Set PDF signing key
wrangler secret put PDF_SIGNING_KEY
# Generate: openssl rand -base64 32
```

#### Pages Environment Variables

Set in Cloudflare Dashboard → Pages → your-project → Settings → Environment Variables:

| Variable | Value | Type |
|----------|-------|------|
| `NEXT_PUBLIC_SITE_URL` | `https://browserscan.org` | Plain text |
| `NEXT_PUBLIC_WORKER_ORIGIN` | `https://api-browserscan.your-subdomain.workers.dev` | Plain text |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Your Turnstile site key | Plain text |
| `NODE_VERSION` | `20` | Plain text |

---

## Database Configuration

### 1. Create D1 Database

```bash
cd workers/network-injector

# Create production database
wrangler d1 create browserscan-db

# Copy the database ID from output
# Example output:
# [[d1_databases]]
# binding = "DB"
# database_name = "browserscan-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update `wrangler.toml`

Edit `workers/network-injector/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "browserscan-db"
database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"  # Replace with ID from step 1
```

### 3. Apply Database Schema

```bash
# From workers/network-injector directory
wrangler d1 execute browserscan-db --file=../../drizzle/schema.sql

# Verify tables were created
wrangler d1 execute browserscan-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

Expected output:
```
scans
recaptcha_simulations
behavior_sessions
```

### 4. Create R2 Bucket

```bash
# Create R2 bucket for PDF reports
wrangler r2 bucket create browserscan-reports

# Update wrangler.toml with bucket name
```

Edit `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "REPORTS_BUCKET"
bucket_name = "browserscan-reports"
```

### 5. Create KV Namespaces

```bash
# Rate limiting KV
wrangler kv:namespace create RATE_LIMIT_KV
# Copy the ID

# IP info cache KV
wrangler kv:namespace create IPINFO_CACHE_KV
# Copy the ID
```

Update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_RATE_LIMIT_KV_ID"

[[kv_namespaces]]
binding = "IPINFO_CACHE_KV"
id = "YOUR_IPINFO_CACHE_KV_ID"
```

---

## Worker Deployment

### 1. Build Worker

```bash
cd workers/network-injector
npm run build
```

### 2. Deploy to Production

```bash
wrangler deploy

# Output shows deployment URL:
# Published browserscan-network-injector
# https://browserscan-network-injector.your-subdomain.workers.dev
```

### 3. Enable workers.dev Subdomain (if needed)

```bash
wrangler subdomain enable
```

### 4. Configure Custom Domain (Recommended)

In Cloudflare Dashboard:
1. Workers & Pages → browserscan-network-injector → Settings → Triggers
2. Add Custom Domain: `api.browserscan.org`
3. DNS will be automatically configured

### 5. Verify Worker Deployment

```bash
# Test health endpoint
curl https://browserscan-network-injector.your-subdomain.workers.dev/api/health

# Expected response:
# {"status":"ok","data":{"env":"production","version":"1.0.0","timestamp":1234567890}}
```

---

## Pages Deployment

### 1. Build Next.js Application

```bash
cd apps/web

# Install dependencies (if not already)
npm install

# Build for Cloudflare Pages
npm run pages:build
```

This creates `.vercel/output/static` using OpenNext Cloudflare adapter.

### 2. Deploy via GitHub Integration (Recommended)

**Setup:**
1. Cloudflare Dashboard → Pages → Create Application
2. Connect to Git → Select Repository
3. Configure build settings:
   - Framework preset: `Next.js`
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `apps/web`

**Environment Variables:**
Add in Pages settings (as listed in Environment Setup section above).

**Deploy:**
- Push to `main` branch triggers automatic deployment
- Pull requests get preview deployments

### 3. Deploy via Wrangler (Alternative)

```bash
cd apps/web

# Build first
npm run pages:build

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=browserscan
```

### 4. Configure Custom Domain

In Cloudflare Dashboard:
1. Pages → browserscan → Custom domains
2. Add domain: `browserscan.org` and `www.browserscan.org`
3. DNS records are automatically created

### 5. Configure HTTPS & Security

**Automatic:**
- SSL/TLS encryption: Full (strict)
- Auto HTTPS Rewrites: Enabled
- Minimum TLS Version: 1.2

**Recommended Settings:**
```
Dashboard → SSL/TLS → Overview
- Encryption mode: Full (strict)

Dashboard → SSL/TLS → Edge Certificates
- Always Use HTTPS: On
- Minimum TLS Version: 1.2
- Opportunistic Encryption: On
- TLS 1.3: On
- Automatic HTTPS Rewrites: On
```

---

## Post-Deployment Verification

### 1. Smoke Tests

Run these tests immediately after deployment:

```bash
# Homepage loads
curl -I https://browserscan.org
# Expect: 200 OK

# Worker health check
curl https://api.browserscan.org/api/health
# Expect: {"status":"ok",...}

# IP lookup tool works
curl -X POST https://api.browserscan.org/api/tools/ip-lookup \
  -H "Content-Type: application/json" \
  -d '{"ip":"8.8.8.8"}'
# Expect: IP intelligence data

# Scan flow works
curl -X POST https://api.browserscan.org/api/scan/start \
  -H "Content-Type: application/json"
# Expect: {"status":"ok","data":{"scan_id":"..."}}
```

### 2. End-to-End Browser Test

1. Visit https://browserscan.org
2. Wait for scan to complete (~3-5 seconds)
3. Verify trust score displays (0-100)
4. Click "View Detailed Report"
5. Check all report sections load:
   - Network Layer
   - Hardware Layer
   - Software Layer
   - Consistency Analysis
6. Test IP Lookup tool
7. Test Leak Test tool
8. Test Behavior Analysis simulation

### 3. Performance Verification

```bash
# Use Lighthouse
npx lighthouse https://browserscan.org --only-categories=performance

# Target scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 95
# SEO: > 95
```

### 4. Monitor Worker Logs

```bash
cd workers/network-injector
wrangler tail browserscan-network-injector --format pretty

# Watch for errors during initial traffic
```

---

## Troubleshooting

### Common Issues

#### 1. Worker "Database not found" Error

**Symptoms:**
```
Error: Database 'browserscan-db' not found
```

**Solution:**
```bash
# Verify D1 database ID in wrangler.toml
wrangler d1 list

# Re-apply schema if needed
wrangler d1 execute browserscan-db --file=../../drizzle/schema.sql
```

#### 2. Pages Build Fails

**Symptoms:**
```
Error: Build failed with exit code 1
```

**Solution:**
1. Check Node.js version in Pages settings (should be 20)
2. Verify build command: `npm run pages:build`
3. Check build logs for dependency issues
4. Ensure environment variables are set

#### 3. CORS Errors in Browser

**Symptoms:**
```
Access to fetch at 'https://api.browserscan.org' from origin 'https://browserscan.org' has been blocked by CORS
```

**Solution:**
- Worker already has CORS configured in `worker.ts`
- Ensure `NEXT_PUBLIC_WORKER_ORIGIN` is set correctly in Pages environment variables
- Verify worker deployment succeeded

#### 4. High Worker CPU Time

**Symptoms:**
- Slow API responses
- Worker CPU time > 30ms

**Solution:**
```bash
# Enable KV caching for IP lookups
# Verify KV bindings in wrangler.toml

# Check for inefficient database queries
wrangler tail --format pretty
```

#### 5. Rate Limiting Too Aggressive

**Symptoms:**
- Users getting 429 errors frequently

**Solution:**
Edit `workers/network-injector/src/middleware/rate-limit.ts`:

```typescript
// Adjust limits
const RATE_LIMITS = {
  strict: { requests: 10, window: 60 },  // Increase from 5
  tool: { requests: 30, window: 60 }     // Increase from 20
};
```

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor error rates in Cloudflare Analytics
- Check worker invocations and success rate

#### Weekly
- Review D1 database size
  ```bash
  wrangler d1 execute browserscan-db --command "SELECT COUNT(*) FROM scans;"
  ```
- Clean old scan data (> 7 days)
  ```bash
  wrangler d1 execute browserscan-db --command "DELETE FROM scans WHERE created_at < datetime('now', '-7 days');"
  ```

#### Monthly
- Review API key usage (IPInfo.io)
- Check R2 storage usage
- Update dependencies:
  ```bash
  npm update
  npm audit fix
  ```

### Updating the Application

#### 1. Update Worker

```bash
cd workers/network-injector
git pull origin main
npm install
npm run build
wrangler deploy
```

#### 2. Update Pages

Push to main branch or manually deploy:

```bash
cd apps/web
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=browserscan
```

### Rollback Procedure

#### Worker Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback
```

#### Pages Rollback

In Cloudflare Dashboard:
1. Pages → browserscan → Deployments
2. Find previous working deployment
3. Click "..." → "Rollback to this deployment"

### Monitoring & Alerts

#### Set Up Alerts

In Cloudflare Dashboard → Account Home → Notifications:

1. **Worker Errors**
   - Notification: Worker Script Error Rate
   - Threshold: > 5% error rate
   - Action: Email + Webhook

2. **Pages Build Failures**
   - Notification: Pages Build Failed
   - Action: Email

3. **D1 Query Errors**
   - Monitor via worker logs
   - Set up custom webhook for D1 errors

#### Key Metrics to Track

- Worker invocations per day
- Average worker CPU time
- Worker error rate
- Pages bandwidth usage
- D1 read/write operations
- R2 storage size
- Cache hit rate (KV)

---

## Security Checklist

Before going live:

- [ ] All secrets configured (not hardcoded)
- [ ] HTTPS enforced (no HTTP access)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all API endpoints
- [ ] HTML escaping in PDF generation
- [ ] Content Security Policy headers set
- [ ] No sensitive data in logs
- [ ] Database backups configured
- [ ] Access logs enabled

---

## Cost Estimation (Cloudflare)

### Free Tier Limits

- **Pages**: Unlimited requests, 500 builds/month
- **Workers**: 100,000 requests/day
- **D1**: 5GB storage, 5M reads/day
- **R2**: 10GB storage, 1M Class A ops/month
- **KV**: 1GB storage, 100,000 reads/day

### Expected Usage (1000 daily users)

- **Worker requests**: ~10,000/day (well within free tier)
- **D1 reads**: ~30,000/day (within free tier)
- **D1 writes**: ~1,000/day (within free tier)
- **R2 storage**: ~100MB/month (PDF reports)

**Estimated monthly cost**: **$0** (Free tier sufficient)

### Scaling Beyond Free Tier

If you exceed free tier limits:

- **Workers Paid**: $5/month + $0.50 per million requests
- **D1 Paid**: Additional storage and reads billed separately
- **R2 Paid**: $0.015/GB storage + $4.50 per million Class A operations

For 10,000 daily users:
- Estimated cost: $10-20/month

---

## Support & Resources

- **Cloudflare Docs**: https://developers.cloudflare.com
- **Workers Docs**: https://developers.cloudflare.com/workers
- **Pages Docs**: https://developers.cloudflare.com/pages
- **D1 Docs**: https://developers.cloudflare.com/d1
- **Community**: https://community.cloudflare.com

---

## Appendix: Complete Deployment Checklist

### Pre-Deployment

- [ ] Code reviewed and tested locally
- [ ] All tests passing (`npm test`, `npm run test:e2e`)
- [ ] Environment variables documented
- [ ] API keys obtained (IPInfo, Turnstile)
- [ ] Cloudflare account configured

### Worker Deployment

- [ ] D1 database created
- [ ] Database schema applied
- [ ] R2 bucket created
- [ ] KV namespaces created
- [ ] wrangler.toml configured with correct IDs
- [ ] Secrets set via `wrangler secret put`
- [ ] Worker built and deployed
- [ ] Custom domain configured
- [ ] Health endpoint responding

### Pages Deployment

- [ ] Build successful locally
- [ ] Environment variables set in Pages dashboard
- [ ] GitHub integration configured (or manual deploy)
- [ ] Custom domain configured
- [ ] SSL/TLS settings verified
- [ ] Homepage loads successfully

### Post-Deployment

- [ ] Smoke tests passed
- [ ] E2E tests passed against production
- [ ] Lighthouse scores acceptable (>90)
- [ ] Error monitoring configured
- [ ] Analytics enabled
- [ ] Documentation updated

### Ongoing

- [ ] Monitor error rates daily
- [ ] Clean old data weekly
- [ ] Review costs monthly
- [ ] Update dependencies quarterly

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
