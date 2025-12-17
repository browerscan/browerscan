# 部署配置总结

## ✅ 完成的配置

### 1. 更新了 wrangler.toml
- 添加了 Cloudflare Account ID: `YOUR_CLOUDFLARE_ACCOUNT_ID`
- 位置: `workers/network-injector/wrangler.toml:5`

### 2. 完善了部署文档
- 更新了 `docs/DEPLOYMENT.md`，包含详细的 GitHub Secrets 配置步骤
- 创建了 `docs/QUICK_START_DEPLOYMENT.md` 快速部署指南

### 3. GitHub Actions 工作流
已有的工作流都正确配置了，使用 GitHub Secrets：
- `.github/workflows/deploy-pages.yml` - 自动部署 Pages
- `.github/workflows/deploy-worker.yml` - 自动部署 Worker
- `.github/workflows/ci.yml` - CI 测试流程

## 🔐 需要在 GitHub 中配置的 Secrets

访问：`Settings → Secrets and variables → Actions → New repository secret`

| Secret 名称 | 值说明 |
|------------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | `YOUR_CLOUDFLARE_ACCOUNT_ID` |
| `CLOUDFLARE_API_TOKEN` | 你的 Cloudflare API Token（需创建） |
| `IPINFO_TOKEN` | 你的 ipinfo.io API token |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile 验证密钥 |
| `PDF_SIGNING_KEY` | `openssl rand -base64 32` 生成 |

## 📋 需要在 GitHub 中配置的 Variables

访问：`Settings → Secrets and variables → Actions → Variables`

| Variable 名称 | 值说明 |
|--------------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://browserscan.org` |
| `NEXT_PUBLIC_WORKER_ORIGIN` | `https://api.browserscan.org` |

## 🚀 部署步骤

### 快速开始（10 分钟）

1. **配置 GitHub Secrets 和 Variables**（见上表）

2. **创建 Cloudflare 资源**：
   ```bash
   npx wrangler login
   npx wrangler d1 create browserscan-db
   npx wrangler r2 bucket create browserscan-reports
   npx wrangler r2 bucket create browserscan-next-cache
   npx wrangler d1 execute browserscan-db --file=drizzle/schema.sql
   ```

3. **推送代码触发自动部署**：
   ```bash
   git push origin main
   ```

4. **设置 Worker Secrets**（首次部署后）：
   ```bash
   echo "your-token" | npx wrangler secret put IPINFO_TOKEN --name browserscan-network-injector
   echo "your-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY --name browserscan-network-injector
   echo "$(openssl rand -base64 32)" | npx wrangler secret put PDF_SIGNING_KEY --name browserscan-network-injector
   ```

## 📚 详细文档

- **快速部署指南**: [docs/QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md)
- **完整部署文档**: [docs/DEPLOYMENT.md](./DEPLOYMENT.md)
- **项目说明**: [CLAUDE.md](../CLAUDE.md)

## ⚠️ 安全提醒

1. **已提供的密钥信息仅用于配置，请妥善保管**
2. **永远不要提交密钥到代码仓库**
3. **所有密钥都通过 GitHub Secrets 和 Cloudflare Secrets 管理**
4. **`.gitignore` 已配置排除所有敏感文件**
5. **定期轮换 API tokens（推荐每 90 天）**

## ✅ 验证部署

部署成功后：

1. 查看 GitHub Actions: `https://github.com/<username>/BrowserScan.org/actions`
2. 测试 Worker: `curl https://<worker-url>/health`
3. 访问 Pages: Cloudflare Dashboard → Pages → 你的项目 URL

## 🔧 故障排查

常见问题和解决方案请查看：[DEPLOYMENT.md - 故障排查部分](./DEPLOYMENT.md#故障排查)

---

配置完成时间：2025-12-10
