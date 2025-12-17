# Wrangler Configuration Setup Guide

**Last Updated**: 2025-12-17
**Security Level**: 🔐 High

---

## 🔒 Security Notice

**wrangler.toml is now PROTECTED and NOT committed to Git.**

As of 2025-12-17, we've implemented a **template-based configuration system** to prevent exposure of Cloudflare resource IDs in public repositories.

### Why This Change?

Based on [Cloudflare Community best practices](https://community.cloudflare.com/t/is-it-safe-to-publish-wrangler-toml-with-account-id-zone-id/116785), while these IDs are not authentication credentials, exposing them publicly can:

- ❌ Reveal infrastructure details to potential attackers
- ❌ Enable targeted reconnaissance attacks
- ❌ Violate principle of least privilege disclosure

**Solution**: Use `wrangler.toml.example` as a template, with real `wrangler.toml` in `.gitignore`.

---

## 🚀 Quick Setup (2 minutes)

### Option A: Automated Setup (Recommended)

```bash
# Run the setup wizard
./scripts/setup-wrangler.sh
```

The wizard will:
1. Copy the template
2. Prompt for your Cloudflare Account ID
3. Prompt for D1 Database ID
4. Prompt for KV Namespace IDs
5. Verify `.gitignore` protection

### Option B: Manual Setup

```bash
# 1. Copy the template
cp workers/network-injector/wrangler.toml.example \
   workers/network-injector/wrangler.toml

# 2. Edit with your actual values
nano workers/network-injector/wrangler.toml

# 3. Verify it's protected
git check-ignore workers/network-injector/wrangler.toml
# Should output: workers/network-injector/wrangler.toml
```

---

## 📋 Required Configuration Values

### 1. Cloudflare Account ID

**Where to find**:
```bash
# Open Cloudflare Dashboard
open "https://dash.cloudflare.com/"
```

Look in the sidebar → Your account ID is displayed under the account name.

**Add to wrangler.toml**:
```toml
account_id = "your-actual-account-id"
```

---

### 2. D1 Database ID

**List existing databases**:
```bash
cd workers/network-injector
npx wrangler d1 list
```

**Or create a new database**:
```bash
npx wrangler d1 create browserscan-db
# Copy the database_id from output
```

**Add to wrangler.toml**:
```toml
[[d1_databases]]
binding = "DB"
database_name = "browserscan-db"
database_id = "your-d1-database-id"
```

---

### 3. KV Namespace IDs (Production)

**List existing KV namespaces**:
```bash
npx wrangler kv:namespace list
```

**Or create new namespaces**:
```bash
# Create rate limiting KV
npx wrangler kv:namespace create "RATE_LIMIT_KV" --preview false

# Create IP info cache KV
npx wrangler kv:namespace create "IPINFO_CACHE_KV" --preview false
```

**Add to wrangler.toml**:
```toml
[env.production]
kv_namespaces = [
  { binding = "RATE_LIMIT_KV", id = "your-rate-limit-kv-id" },
  { binding = "IPINFO_CACHE_KV", id = "your-ipinfo-cache-kv-id" }
]
```

---

## ✅ Verification Checklist

After setup, verify your configuration:

```bash
# 1. Check wrangler.toml exists
[ -f workers/network-injector/wrangler.toml ] && echo "✓ wrangler.toml exists"

# 2. Verify it's protected by .gitignore
git check-ignore workers/network-injector/wrangler.toml && echo "✓ Protected by .gitignore"

# 3. Verify no placeholders remain
if grep -q "YOUR_" workers/network-injector/wrangler.toml; then
    echo "⚠️  WARNING: Placeholders still present!"
else
    echo "✓ All placeholders replaced"
fi

# 4. Test wrangler can read the config
cd workers/network-injector
npx wrangler whoami && echo "✓ Wrangler configuration valid"
```

---

## 🚨 Security Best Practices

### ✅ DO:
- ✅ Use the template (`wrangler.toml.example`)
- ✅ Keep `wrangler.toml` in `.gitignore`
- ✅ Replace all `YOUR_*` placeholders
- ✅ Verify protection before committing: `git status`

### ❌ DON'T:
- ❌ Commit `wrangler.toml` to version control
- ❌ Share your actual IDs in public channels
- ❌ Remove `wrangler.toml` from `.gitignore`
- ❌ Use the same values across dev/staging/production

---

## 🔄 CI/CD Configuration

For GitHub Actions deployments, **DO NOT** store these IDs in GitHub Secrets. Instead:

1. **Account ID**: Use GitHub repository variable `CLOUDFLARE_ACCOUNT_ID`
2. **Resource IDs**: Pass via wrangler commands dynamically

**Example GitHub Actions workflow**:
```yaml
- name: Deploy Worker
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
  run: |
    cd workers/network-injector
    # Use wrangler deploy with explicit account ID
    npx wrangler deploy --compatibility-date=2024-11-27
```

---

## 🆘 Troubleshooting

### Error: "Missing account_id in configuration"

```bash
# Check if wrangler.toml exists
ls -la workers/network-injector/wrangler.toml

# If missing, run setup wizard
./scripts/setup-wrangler.sh
```

### Error: "D1 database not found"

```bash
# Verify database exists
npx wrangler d1 list

# Create if missing
npx wrangler d1 create browserscan-db
```

### Error: "KV namespace not found"

```bash
# List existing namespaces
npx wrangler kv:namespace list

# Create missing namespaces
npx wrangler kv:namespace create "RATE_LIMIT_KV" --preview false
npx wrangler kv:namespace create "IPINFO_CACHE_KV" --preview false
```

---

## 📚 Related Documentation

- [Cloudflare Wrangler Configuration Docs](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Is it safe to publish wrangler.toml? (Cloudflare Community)](https://community.cloudflare.com/t/is-it-safe-to-publish-wrangler-toml-with-account-id-zone-id/116785)
- [Security Setup Guide](./SECURITY_SETUP.md)

---

## 🔄 Migration from Old Setup

If you previously had `wrangler.toml` tracked in Git:

```bash
# 1. Backup current wrangler.toml
cp workers/network-injector/wrangler.toml \
   workers/network-injector/wrangler.toml.backup

# 2. Remove from Git tracking
git rm --cached workers/network-injector/wrangler.toml

# 3. Commit the removal
git commit -m "security: remove wrangler.toml from version control"

# 4. Verify it's now ignored
git status  # Should NOT show wrangler.toml

# 5. Restore your local copy
mv workers/network-injector/wrangler.toml.backup \
   workers/network-injector/wrangler.toml
```

---

**Questions?** See [SECURITY.md](../.github/SECURITY.md) or open an issue.
