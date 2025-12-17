# BrowserScan.org

> Browser fingerprinting and trust score analysis platform built on Cloudflare's full stack (Pages + Workers + D1 + R2)

## 🚀 Quick Start

**New to this project?** Start here:

1. **Install dependencies**: `npm install`
2. **Configure environment**: Environment files are already created (see below)
3. **Start development**: `npm run dev`
4. **Open browser**: http://localhost:3000

📖 **Detailed instructions**: [Quick Start Guide](./docs/QUICK_START.md)

## 📁 Project Structure

```
apps/web/              # Next.js 16 frontend (Cloudflare Pages)
workers/network-injector/  # Cloudflare Worker API
packages/types/        # Shared TypeScript types
docs/                  # Documentation
```

## 🔑 Environment Variables

Environment files have been created with default values:

- ✅ `apps/web/.env.local` - Frontend configuration
- ✅ `workers/network-injector/.dev.vars` - Worker secrets

**For local development, no changes needed!** The app works with defaults.

**Optional API keys** (for enhanced features):
- IPInfo.io token (free 50k/month): https://ipinfo.io/signup
- Cloudflare Turnstile keys: https://dash.cloudflare.com/

See [Quick Start Guide](./docs/QUICK_START.md#-获取可选-api-密钥) for setup.

## 🛠️ Development Commands

```bash
npm run dev          # Start frontend + worker (concurrent)
npm run build        # Build all projects
npm run test         # Run unit tests (71 tests)
npm run test:e2e     # Run E2E tests
npm run typecheck    # TypeScript validation
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](./docs/QUICK_START.md) | Get up and running in 5 minutes |
| [Quick Deploy](./docs/QUICK_START_DEPLOYMENT.md) | ⚡ Deploy to Cloudflare in 10 minutes |
| [Deployment Guide](./docs/DEPLOYMENT.md) | Complete deployment and operations guide |
| [Production Deployment](./docs/PRODUCTION_DEPLOYMENT.md) | Detailed production setup |
| [Deployment Summary](./docs/DEPLOYMENT_SUMMARY.md) | Configuration checklist |
| [Project Completion Summary](./docs/PROJECT_COMPLETION_SUMMARY.md) | Full project status and metrics |
| [OG Image Guide](./docs/OG_IMAGE_GUIDE.md) | Social media preview image creation |

## ✨ Features

- 🔍 **Browser Fingerprinting**: Canvas, WebGL, audio context, fonts detection
- 🌐 **Network Analysis**: IP intelligence, TLS fingerprinting (JA3/JA4), ASN lookup
- 🔒 **Leak Detection**: WebRTC, DNS, IPv6 leak testing
- 📊 **Trust Scoring**: Deduction-based scoring system (0-100)
- 🤖 **Bot Detection**: Behavioral analysis, automation detection
- 📄 **PDF Reports**: Generate detailed analysis reports

## 🧪 Testing

- ✅ **71 unit tests** (all passing)
- ✅ **15+ E2E scenarios** (Playwright)
- ✅ **WCAG AA compliant** (accessibility)

## 🚀 Deployment

**Ready for production!** This project uses GitHub Actions for automatic deployment to Cloudflare.

### Quick Deploy (10 minutes)

1. **Configure GitHub Secrets**: See [Quick Deploy Guide](./docs/QUICK_START_DEPLOYMENT.md)
2. **Push to main branch**: Automatic deployment via GitHub Actions
3. **Done!** Your app is live on Cloudflare

**Manual deploy**:
```bash
# Deploy worker
npm run deploy:worker

# Deploy pages
npm run deploy:pages
```

📖 **Complete guides**:
- [Quick Deploy Guide](./docs/QUICK_START_DEPLOYMENT.md) - Fast setup
- [Full Deployment Guide](./docs/DEPLOYMENT.md) - Detailed instructions
- [Deployment Summary](./docs/DEPLOYMENT_SUMMARY.md) - Configuration checklist

## 📊 Project Status

- ✅ **Security**: XSS vulnerabilities fixed
- ✅ **Features**: All tools implemented
- ✅ **Testing**: Comprehensive coverage
- ✅ **Accessibility**: WCAG AA compliant
- ✅ **Documentation**: Complete guides
- ✅ **Production Ready**: Can deploy now

See [PROJECT_COMPLETION_SUMMARY.md](./docs/PROJECT_COMPLETION_SUMMARY.md) for details.

## 🤝 Tech Stack

- **Frontend**: Next.js 16, React 19, TanStack Query, Framer Motion, Tailwind CSS
- **Backend**: Cloudflare Workers (Hono), D1 (SQLite), R2, KV
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest, Playwright
- **Deployment**: Cloudflare Pages + Workers

## 📝 License

[Add your license here]

---

**Status**: 🎉 Production Ready | **Last Updated**: 2025-01-15
