# 快速部署指南

本指南帮助你在 10 分钟内完成 BrowserScan.org 到 Cloudflare 的部署配置。

## 前置要求

- GitHub 账户（仓库管理员权限）
- Cloudflare 账户
- 本地已安装 Node.js 20+

## 第一步：配置 GitHub Secrets（5 分钟）

### 1. 在 GitHub 仓库设置 Secrets

访问：`https://github.com/<your-username>/BrowserScan.org/settings/secrets/actions`

点击 **New repository secret**，依次添加以下 5 个密钥：

| Secret 名称 | 值 |
|------------|-----|
| `CLOUDFLARE_ACCOUNT_ID` | `YOUR_CLOUDFLARE_ACCOUNT_ID` |
| `CLOUDFLARE_API_TOKEN` | 你的 Cloudflare API Token（见下方获取方法） |
| `IPINFO_TOKEN` | 你的 ipinfo.io token |
| `TURNSTILE_SECRET_KEY` | 你的 Cloudflare Turnstile secret |
| `PDF_SIGNING_KEY` | 运行 `openssl rand -base64 32` 生成 |

### 2. 在 GitHub 仓库设置 Variables

切换到 **Variables** 标签页，添加：

| Variable 名称 | 值 |
|--------------|-----|
| `NEXT_PUBLIC_SITE_URL` | `https://browserscan.org` |
| `NEXT_PUBLIC_WORKER_ORIGIN` | `https://api.browserscan.org` |

### 如何获取 Cloudflare API Token？

1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 **Create Token**
3. 选择 **Custom token**
4. 添加权限：
   - Account → Cloudflare Pages → Edit
   - Account → Workers Scripts → Edit
   - Account → D1 → Edit
   - Account → Workers R2 Storage → Edit
5. 创建并复制 token

## 第二步：创建 Cloudflare 资源（3 分钟）

在本地终端运行：

```bash
# 登录 Cloudflare
npx wrangler login

# 创建 D1 数据库
npx wrangler d1 create browserscan-db

# 创建 R2 存储桶
npx wrangler r2 bucket create browserscan-reports
npx wrangler r2 bucket create browserscan-next-cache

# 应用数据库 schema
npx wrangler d1 execute browserscan-db --file=drizzle/schema.sql
```

**重要**: 记录 D1 数据库 ID，更新到 `workers/network-injector/wrangler.toml` 的第 12 行：

```toml
database_id = "你的数据库ID"
```

## 第三步：推送代码触发部署（2 分钟）

```bash
# 提交更改
git add .
git commit -m "chore: configure deployment settings"

# 推送到 main 分支（将自动触发部署）
git push origin main
```

## 第四步：设置 Worker Secrets（1 分钟）

部署完成后，设置 Worker 运行时密钥：

```bash
# 设置 IPINFO_TOKEN
echo "your-ipinfo-token" | npx wrangler secret put IPINFO_TOKEN --name browserscan-network-injector

# 设置 TURNSTILE_SECRET_KEY
echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY --name browserscan-network-injector

# 设置 PDF_SIGNING_KEY
echo "$(openssl rand -base64 32)" | npx wrangler secret put PDF_SIGNING_KEY --name browserscan-network-injector
```

## 验证部署

### 1. 检查 GitHub Actions

访问：`https://github.com/<your-username>/BrowserScan.org/actions`

应该看到三个成功的 workflows：
- ✅ CI
- ✅ Deploy Pages
- ✅ Deploy Worker

### 2. 测试 Worker API

```bash
# 检查 Worker 健康状态
curl https://browserscan-network-injector.<your-account>.workers.dev/health
```

### 3. 访问网站

打开 Cloudflare Pages 分配的 URL（在 Pages dashboard 中查看）

## 故障排查

### GitHub Actions 失败？

**错误**: "Authentication error"
- 检查 `CLOUDFLARE_API_TOKEN` 是否正确
- 确认 API Token 有足够权限

**错误**: "Database not found"
- 确认已创建 D1 数据库
- 检查 `wrangler.toml` 中的 `database_id` 是否正确

### Worker 运行时错误？

**错误**: "IPINFO_TOKEN is not defined"
- 运行第四步设置 Worker Secrets

### Pages 部署失败？

**错误**: "R2 bucket not found"
- 确认已创建两个 R2 存储桶

## 自定义域名配置（可选）

### 配置 Pages 域名

1. Cloudflare Pages → 你的项目 → Custom domains
2. 添加域名：`browserscan.org`
3. 按提示配置 DNS

### 配置 Worker 域名

1. Workers & Pages → browserscan-network-injector → Settings → Triggers
2. 添加 Custom Domain：`api.browserscan.org`
3. 配置 DNS CNAME 记录

### 更新环境变量

在 GitHub Variables 中更新：
- `NEXT_PUBLIC_SITE_URL` → `https://browserscan.org`
- `NEXT_PUBLIC_WORKER_ORIGIN` → `https://api.browserscan.org`

## 完成！🎉

你的 BrowserScan.org 现在已经部署到 Cloudflare！

### 下一步

- 配置自定义域名
- 设置 Cloudflare Analytics 监控
- 查看完整部署文档：[DEPLOYMENT.md](./DEPLOYMENT.md)

## 需要帮助？

- 查看详细文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
- 查看项目说明：[CLAUDE.md](../CLAUDE.md)
- GitHub Issues：报告问题或寻求帮助

---

**安全提醒**：
- 永远不要提交 `.env.local` 或任何包含密钥的文件
- 定期轮换 API tokens（推荐每 90 天）
- 使用最小权限原则配置 API tokens
