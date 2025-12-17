# 🚀 快速部署指南

## 前置要求（必须完成）

在运行部署脚本前，请先完成以下两个步骤：

### 1. 启用 R2 存储（1 分钟）

访问并启用 R2：
```
https://dash.cloudflare.com/YOUR_ACCOUNT_ID/r2
```

点击 "购买 R2" 或 "Enable R2"，接受服务条款。

### 2. 注册 workers.dev 子域名（1 分钟）

访问并注册子域名：
```
https://dash.cloudflare.com/YOUR_ACCOUNT_ID/workers/onboarding
```

建议子域名: `browserscan`

## 一键部署

完成上述步骤后，运行自动化部署脚本：

```bash
./deploy-complete.sh
```

脚本会自动完成：
- ✅ 验证认证
- ✅ 创建 R2 buckets
- ✅ 构建和部署 Worker
- ✅ 设置 Worker secrets
- ✅ 构建和部署 Pages

## 手动部署命令（如需要）

### 部署 Worker

```bash
# Set these in your environment or .env file - NEVER commit these values!
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"

# 构建
npm run build:worker

# 部署
cd workers/network-injector
npx wrangler deploy --env=""
cd ../..
```

### 设置 Worker Secrets

```bash
# IPINFO_TOKEN
echo "your-ipinfo-token" | npx wrangler secret put IPINFO_TOKEN --name browserscan-network-injector

# TURNSTILE_SECRET_KEY
echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY --name browserscan-network-injector

# PDF_SIGNING_KEY
echo "$(openssl rand -base64 32)" | npx wrangler secret put PDF_SIGNING_KEY --name browserscan-network-injector
```

### 部署 Pages

```bash
cd apps/web
npm run pages:build
npx wrangler pages deploy .open-next/assets --project-name=browserscan-web
cd ../..
```

## 验证部署

### 测试 Worker

```bash
# 健康检查
curl https://browserscan-network-injector.<your-subdomain>.workers.dev/health

# 或通过变量
WORKER_URL="<your-worker-url>"
curl $WORKER_URL/health
```

### 查看日志

```bash
# Worker 日志
npx wrangler tail browserscan-network-injector

# Pages 部署列表
npx wrangler pages deployment list browserscan-web
```

## 已创建的资源

| 资源 | ID |
|------|-----|
| D1 Database | `YOUR_D1_DATABASE_ID` |
| KV: RATE_LIMIT | `YOUR_RATE_LIMIT_KV_ID` |
| KV: IPINFO_CACHE | `YOUR_IPINFO_CACHE_KV_ID` |

## 获取 API 密钥

- **IPINFO_TOKEN**: https://ipinfo.io/account/token
- **TURNSTILE_SECRET_KEY**: https://dash.cloudflare.com/YOUR_ACCOUNT_ID/turnstile

## 问题排查

### Worker 部署失败

**错误**: "You need to register a workers.dev subdomain"
- 解决: 访问 workers onboarding 页面注册子域名

**错误**: "R2 not enabled"
- 解决: 访问 R2 控制台启用服务

### Pages 部署失败

**错误**: "Project not found"
- 解决: 首次部署会自动创建项目

### Secrets 设置失败

**错误**: "Worker not found"
- 解决: 确保 Worker 已成功部署

## 自动化部署（推荐）

配置 GitHub Actions 后，只需推送代码即可自动部署：

```bash
git push origin main
```

查看 [DEPLOYMENT.md](./docs/DEPLOYMENT.md) 了解如何配置 GitHub Actions。

## 有用的链接

- **Cloudflare Dashboard**: https://dash.cloudflare.com/YOUR_ACCOUNT_ID
- **Workers 控制台**: https://dash.cloudflare.com/YOUR_ACCOUNT_ID/workers
- **Pages 控制台**: https://dash.cloudflare.com/YOUR_ACCOUNT_ID/pages
- **R2 控制台**: https://dash.cloudflare.com/YOUR_ACCOUNT_ID/r2
- **D1 控制台**: https://dash.cloudflare.com/YOUR_ACCOUNT_ID/d1

## 需要帮助？

- 查看详细文档: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- 查看部署状态: [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)
- GitHub Issues: 报告问题或寻求帮助
