# GitHub Actions Security Setup Guide

This guide explains how to securely configure GitHub Secrets for automatic deployment to Cloudflare.

## ⚠️ Security Warning

**NEVER commit sensitive tokens or API keys to your repository!** Even if you plan to delete them later, they will remain in git history and can be accessed by anyone.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository settings.

### 1. Navigate to GitHub Repository Settings

1. Go to your repository: `https://github.com/browerscan/BrowserScan.org`
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

### 2. Add Cloudflare Secrets

#### `CLOUDFLARE_API_TOKEN`
- **Value**: Your Cloudflare API token
- **How to get it**:
  1. Log in to Cloudflare Dashboard
  2. Go to **My Profile** → **API Tokens**
  3. Create a token with these permissions:
     - **Account** → **Cloudflare Pages** → Edit
     - **Account** → **Workers Scripts** → Edit
     - **Account** → **D1** → Edit
     - **Zone** → **DNS** → Read (if using custom domains)
  4. Copy the token (it starts with something like `u2v_...`)

#### `CLOUDFLARE_ACCOUNT_ID`
- **Value**: `YOUR_CLOUDFLARE_ACCOUNT_ID`
- **Note**: This is already in `wrangler.toml` but should also be added as a secret for workflow consistency

### 3. Add Repository Variables (Non-Sensitive)

These are public configuration values, not secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **Variables** tab
3. Click **New repository variable**

#### `NEXT_PUBLIC_SITE_URL`
- **Value**: `https://browserscan.org` (or your production URL)
- **Purpose**: Frontend site URL

#### `NEXT_PUBLIC_WORKER_ORIGIN`
- **Value**: `https://browserscan-network-injector.your-subdomain.workers.dev`
- **Purpose**: Worker API endpoint

### 4. Optional: GitHub Token (Usually Not Needed)

For most deployment workflows, you **don't need** a custom GitHub token because GitHub Actions automatically provides `GITHUB_TOKEN` with appropriate permissions.

**Only add this if you need special operations** (e.g., triggering workflows in other repositories):

#### `GH_PERSONAL_ACCESS_TOKEN` (Optional)
- **How to create**:
  1. Go to GitHub **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
  2. Click **Generate new token (classic)**
  3. Select scopes:
     - `repo` (if accessing private repos)
     - `workflow` (if triggering workflows)
  4. Click **Generate token**
  5. Copy the token (starts with `ghp_...`)

## Verify Configuration

After adding all secrets, your **Secrets** page should show:

```
✓ CLOUDFLARE_API_TOKEN
✓ CLOUDFLARE_ACCOUNT_ID
```

And your **Variables** page should show:

```
✓ NEXT_PUBLIC_SITE_URL
✓ NEXT_PUBLIC_WORKER_ORIGIN
```

## Test Deployment

1. Push a commit to the `main` branch:
   ```bash
   git add .
   git commit -m "test: trigger deployment"
   git push origin main
   ```

2. Go to **Actions** tab in your GitHub repository
3. Watch the **Deploy to Cloudflare** workflow run
4. Check for successful completion

## Troubleshooting

### "Error: Missing CLOUDFLARE_API_TOKEN"
- Ensure the secret is added in repository settings
- Check the secret name matches exactly (case-sensitive)
- Try re-adding the secret

### "Error: Unauthorized" or "Invalid API token"
- Verify your Cloudflare API token has correct permissions
- Create a new token with the required scopes listed above
- Update the secret with the new token

### "Error: Account ID mismatch"
- Ensure `CLOUDFLARE_ACCOUNT_ID` matches your Cloudflare account
- Find your Account ID in Cloudflare Dashboard → **Workers & Pages** → right sidebar

## Security Best Practices

1. ✅ **DO**: Store all sensitive data as GitHub Secrets
2. ✅ **DO**: Use scoped API tokens with minimal required permissions
3. ✅ **DO**: Rotate tokens regularly (every 3-6 months)
4. ✅ **DO**: Use `workflow_dispatch` to allow manual deployment triggers
5. ❌ **DON'T**: Commit tokens or secrets to the repository
6. ❌ **DON'T**: Share tokens in issues, PRs, or discussions
7. ❌ **DON'T**: Use root/admin API keys for CI/CD

## Token Rotation Checklist

When rotating tokens:

- [ ] Create new Cloudflare API token
- [ ] Update `CLOUDFLARE_API_TOKEN` in GitHub Secrets
- [ ] Test deployment with new token
- [ ] Delete old token from Cloudflare Dashboard
- [ ] Document rotation date in your security log

## Additional Resources

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Cloudflare API Token Best Practices](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [OpenNext Cloudflare Deployment](https://opennext.js.org/cloudflare)

---

**Last Updated**: 2025-12-17
**Maintained By**: BrowserScan.org Team
