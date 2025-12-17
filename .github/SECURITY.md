# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in BrowserScan.org, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [your-security-email@example.com]
3. Include detailed steps to reproduce the issue
4. Allow 48-72 hours for initial response

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| older   | :x:                |

## Security Practices

### Secrets Management

- All API keys and tokens are stored as GitHub Secrets
- No sensitive data is committed to the repository
- Environment variables are validated at runtime
- See [SECURITY_SETUP.md](../docs/SECURITY_SETUP.md) for configuration guide

#### Cloudflare Resource IDs

As of 2025-12-17, we use a **template-based approach** for Wrangler configuration:

- ✅ `wrangler.toml.example` - Template with placeholders (committed)
- ❌ `wrangler.toml` - Real configuration with IDs (gitignored)

**Rationale**: While resource IDs (account_id, database_id, KV namespace IDs) are not authentication credentials, exposing them in public repositories can reveal infrastructure details and enable targeted attacks. Based on [Cloudflare Community recommendations](https://community.cloudflare.com/t/is-it-safe-to-publish-wrangler-toml-with-account-id-zone-id/116785), we protect these IDs for defense-in-depth security.

**Setup Guide**: See [WRANGLER_SETUP.md](../docs/WRANGLER_SETUP.md)

### Dependency Management

- Dependencies are automatically scanned by Dependabot
- Critical security updates are applied within 48 hours
- All dependencies are pinned to specific versions

### Access Control

- Cloudflare API tokens use minimal required permissions
- GitHub Actions workflows use scoped tokens
- Production deployments require manual approval (via `environment: production`)

### Code Review

- All changes require pull request review
- Automated CI/CD checks must pass before merge
- Security-sensitive code requires additional review

## Best Practices for Contributors

1. **Never commit**:
   - API keys or tokens (use GitHub Secrets)
   - Private keys or certificates
   - Real `wrangler.toml` files (use `wrangler.toml.example` template)
   - `.env` files with actual credentials (use `.env.example` template)
   - Database credentials
   - User data or PII

2. **Always**:
   - Use environment variables for configuration
   - Validate user input
   - Follow OWASP secure coding practices
   - Keep dependencies up to date

3. **Before submitting PRs**:
   - Run `npm run lint` and fix warnings
   - Run `npm run typecheck` and resolve errors
   - Test locally with `.env.local` (never commit this file)
   - Remove any debug code or console.logs with sensitive data

## Known Security Considerations

### Browser Fingerprinting

This project intentionally collects browser fingerprinting data for security analysis. All data collection is:
- Transparent to users
- Used only for displaying fingerprint analysis
- Not shared with third parties
- Stored temporarily (24-48 hours)

### IP Intelligence

IP address lookups use third-party services (ipinfo.io). Users should:
- Review our privacy policy
- Understand that IP addresses are inherently identifiable
- Use VPNs/proxies if desired for privacy testing

## Automated Security

- **GitHub Actions**: All workflows use trusted actions with pinned versions
- **Cloudflare**: WAF rules and rate limiting protect production endpoints
- **Dependabot**: Automatically scans for vulnerable dependencies
- **CodeQL**: Performs static code analysis on every PR

## Incident Response

In case of security incident:

1. Issue will be triaged within 24 hours
2. Patch will be developed and tested
3. Fix will be deployed to production immediately
4. Post-mortem will be published (if appropriate)
5. Affected users will be notified (if applicable)

---

**Last Updated**: 2025-12-17
