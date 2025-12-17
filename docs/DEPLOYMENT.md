# BrowserScan.org — 部署与运维指南

_版本：2025-11-27_

## 1. 环境变量与 Secrets

### 1.1 GitHub Repository Secrets

**重要提示**：所有密钥必须通过 GitHub Secrets 配置，永远不要硬编码在代码中！

在 GitHub 仓库中设置以下 Secrets（Settings → Secrets and variables → Actions → New repository secret）：

| Secret 名称 | 说明 | 如何获取 |
| --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | 示例: `YOUR_CLOUDFLARE_ACCOUNT_ID` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | 至少需要权限: Pages Edit, Workers Scripts Edit, D1 Edit, R2 Edit |
| `IPINFO_TOKEN` | IP Intelligence API Token | 从 ipinfo.io 获取 |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile 验证密钥 | Cloudflare Dashboard → Turnstile |
| `PDF_SIGNING_KEY` | PDF 报告签名密钥 | 随机生成的强密码字符串 |

### 1.2 GitHub Repository Variables

在 GitHub 仓库中设置以下 Variables（Settings → Secrets and variables → Actions → Variables）：

| Variable 名称 | 说明 | 示例值 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 生产环境站点 URL | `https://browserscan.org` |
| `NEXT_PUBLIC_WORKER_ORIGIN` | Worker API 地址 | `https://api.browserscan.org` |

### 1.3 Cloudflare Worker Secrets

Worker 运行时的 Secrets 需要通过 Wrangler CLI 设置：

```bash
# 登录 Cloudflare
npx wrangler login

# 设置 Worker Secrets（注意：这些值不会出现在 wrangler.toml 中）
echo "your-ipinfo-token" | npx wrangler secret put IPINFO_TOKEN
echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY
echo "your-pdf-signing-key" | npx wrangler secret put PDF_SIGNING_KEY
```

### 1.4 环境变量一览表

| Key | 说明 | 存储位置 |
| --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | GitHub Secret + wrangler.toml |
| `CLOUDFLARE_API_TOKEN` | API Token | GitHub Secret |
| `D1_DATABASE_ID` | `browserscan-db` ID | wrangler.toml |
| `R2_BUCKET_NAME` | `browserscan-reports` | wrangler.toml |
| `TURNSTILE_SITE_KEY` | Turnstile 前端 key | Cloudflare Pages 环境变量 |
| `TURNSTILE_SECRET_KEY` | Turnstile 验证 secret | Wrangler secret + GitHub Secret |
| `IPINFO_TOKEN` | IP intelligence token | Wrangler secret + GitHub Secret |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL | GitHub Variable |
| `NEXT_PUBLIC_WORKER_ORIGIN` | Worker API URL | GitHub Variable |
| `PDF_SIGNING_KEY` | HMAC 秘钥 | Wrangler secret + GitHub Secret |

> **安全规则**：
> - `.env.local` **永不提交**，使用 `cp .env.example .env.local` 创建本地配置
> - 生产环境仅通过 Cloudflare Secrets 和 GitHub Actions Secrets 注入
> - 定期轮换所有 API tokens（推荐每 90 天）
> - 确保 `.gitignore` 包含 `.env*`, `*.pem`, `wrangler.toml` 中的敏感配置

## 2. 本地开发流程
```bash
npm install
npm run dev:web          # Next.js 前端 (localhost:3000)
npm run dev:worker       # Miniflare 运行 Worker (http://127.0.0.1:8787)
npm run dev:full         # 并行启动 web + worker + tailwind watch
```
- `wrangler.toml` 绑定：
  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "browserscan-db"
  database_id = "..."
  ```
- 本地 D1：`npx wrangler d1 migrations apply browserscan-db --local`。

## 3. Cloudflare Pages 部署
### 3.1 使用 Wrangler CLI
1. `npx wrangler login`
2. `npm run pages:build` (调用 `@cloudflare/next-on-pages` 输出 `.vercel/output/static`)
3. `npx wrangler pages deploy .vercel/output/static --project-name=browserscan-web`
4. 设置环境变量（Production + Preview 两套）：
   ```bash
   npx wrangler pages project secret put TURNSTILE_SITE_KEY
   npx wrangler pages project secret put NEXT_PUBLIC_SITE_URL
   ```

### 3.2 GitHub 集成
- Cloudflare Pages 连接 `BrowserScan.org` 仓库。
- Build command: `npm run pages:build`
- Output dir: `.vercel/output/static`
- Node version: `20.x`
- 设置 secrets 同上。

## 4. Workers & D1 部署
### 4.1 初始化
```bash
npx wrangler d1 create browserscan-db
npx wrangler d1 execute browserscan-db --file=drizzle/schema.sql
npx wrangler r2 bucket create browserscan-reports
```
### 4.2 发布 Worker
```bash
npm run build:worker
npx wrangler deploy workers/network-injector/src/worker.ts --name browserscan-worker
```
- 绑定资源：
  ```toml
  [[r2_buckets]]
  binding = "REPORTS_BUCKET"
  bucket_name = "browserscan-reports"

  [[r2_buckets]]
  binding = "NEXT_INC_CACHE_R2_BUCKET"
  bucket_name = "browserscan-next-cache"

  [[kv_namespaces]]
  binding = "RATE_LIMIT_KV"
  id = "..."

  [[kv_namespaces]]
  binding = "IPINFO_CACHE_KV"
  id = "..."

  [[d1_databases]]
  binding = "DB"
  database_name = "browserscan-db"
  database_id = "..."
  ```

## 5. GitHub Actions 工作流
1. **CI (`.github/workflows/ci.yml`)**
   - 触发：PR、`main` push。
   - 步骤：`npm ci` → `npm run lint` → `npm run test` → `npm run typecheck` → `npm run pages:build`。
2. **Deploy Pages (`deploy-pages.yml`)**
   - 触发：`main` push。
   - 使用 `CLOUDFLARE_API_TOKEN` 调用 `wrangler pages deploy`。
3. **Deploy Worker (`deploy-worker.yml`)**
   - 触发：`main` push 或 tag。
   - 步骤：`npm run build:worker` → `wrangler deploy`。
4. **Database Migration (`migrate.yml`)**
   - 手动触发（workflow_dispatch）。
   - 运行 `npx wrangler d1 migrations apply browserscan-db`。
5. **Seed Script (`npm run seed:d1`)**
   - `scripts/seed-demo.ts` 使用 `wrangler d1 execute` 将 demo 报告写入 Cloudflare D1，用于本地/预览数据填充。

> GitHub 仓库为 public，Actions 中所有 secrets 通过 `actions/vars`/`secrets` 管理，Workflow 中禁止直接 echo。

## 6. 生产验证 Checklist
1. `wrangler pages deployment list` 确认最新版本 `production` 状态为 `ACTIVE`。
2. `wrangler tail browserscan-worker` 观察无错误日志。
3. 打开 `https://browserscan.org` 手动执行：
   - Dashboard 自动扫描并显示评分；
   - `/report/network` 展示数据；
   - `/tools/ip-lookup` 查询成功；
   - PDF 导出下载可用。
4. Turnstile 验证成功后 Worker 返回 200。
5. D1 新增记录 `SELECT count(*) FROM scans;` /

## 7. 回滚策略
- Pages：`wrangler pages deployment rollback --project-name browserscan-web --deployment-id <id>`。
- Worker：`wrangler versions rollback browserscan-worker <version_id>`。
- 数据：
  - D1 回滚使用备份 SQL（每日导出 `wrangler d1 export`）。
  - R2 删除通过 Lifecycle 规则；如需恢复，保留 7 天版本。

## 8. 监控与日志
- 启用 Cloudflare Pages Insights（访问量、错误率）。
- Worker 使用 `wrangler tail` + Logpush (to R2/Storage)。
- 自建 `/api/health` 返回：`version`, `uptime`, `d1`, `r2`, `kv` 状态。
- Cron Job 发送每日摘要至 Slack/Webhook：扫描次数、平均分、错误计数。

## 9. 灰度/多环境策略
- 分支 `dev` → Cloudflare Pages preview 环境。
- `main` → production。
- Worker 使用 `--env dev` `--env prod` 切换
  ```toml
  [env.dev]
  vars = { ENVIRONMENT = "dev" }
  [[env.dev.d1_databases]] ...
  ```
- 外部 API token 区分测试/生产，避免污染。

## 10. 安全自检
- `npm run lint:secrets`（gitleaks）在 CI 中执行。
- 确认 `.gitignore` 包含 `.env*`, `*.pem`, `reports/*.pdf`。
- 定期 rotate Cloudflare / GitHub tokens (每 90 天)。

---

## 附录 A: GitHub Secrets 设置详细步骤

### 步骤 1: 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击右上角头像 → **My Profile** → **API Tokens**
3. 点击 **Create Token** → 选择 **Custom token**
4. 配置权限：
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Account Settings** → **Read**
   - **Account** → **D1** → **Edit**
   - **Account** → **Workers R2 Storage** → **Edit**
5. 设置 Account Resources: 选择你的账户
6. 设置 IP Address Filtering（可选）: 如果需要限制 GitHub Actions IP
7. 点击 **Continue to summary** → **Create Token**
8. **重要**: 复制并保存这个 token（只显示一次）

### 步骤 2: 在 GitHub 中配置 Secrets

1. 打开你的 GitHub 仓库页面
2. 导航到 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**

#### 需要添加的 Secrets:

**CLOUDFLARE_ACCOUNT_ID**:
- 值: `YOUR_CLOUDFLARE_ACCOUNT_ID`（你的 Cloudflare Account ID）
- 获取方式: Cloudflare Dashboard → 任意页面右侧栏可以看到 Account ID

**CLOUDFLARE_API_TOKEN**:
- 值: 步骤 1 中创建的 API Token
- 示例格式: `u2v_xxx...`

**IPINFO_TOKEN**:
- 值: 你的 ipinfo.io API token
- 获取方式: [ipinfo.io](https://ipinfo.io/account/token)

**TURNSTILE_SECRET_KEY**:
- 值: Cloudflare Turnstile 验证密钥
- 获取方式: Cloudflare Dashboard → Turnstile → 你的站点 → Secret Key

**PDF_SIGNING_KEY**:
- 值: 随机生成的强密码（用于签名 PDF URLs）
- 生成方式: `openssl rand -base64 32`

### 步骤 3: 在 GitHub 中配置 Variables

1. 在同一个 **Secrets and variables → Actions** 页面
2. 切换到 **Variables** 标签页
3. 点击 **New repository variable**

#### 需要添加的 Variables:

**NEXT_PUBLIC_SITE_URL**:
- 值: `https://browserscan.org`（你的生产域名）

**NEXT_PUBLIC_WORKER_ORIGIN**:
- 值: `https://api.browserscan.org`（你的 Worker API 域名）

### 步骤 4: 验证配置

运行以下命令验证 GitHub Actions 可以访问这些 Secrets：

```bash
# 推送代码到 main 分支触发自动部署
git push origin main

# 查看 GitHub Actions 运行状态
# 访问: https://github.com/<your-username>/BrowserScan.org/actions
```

如果看到以下成功信息，说明配置正确：
- ✅ Deploy Pages workflow 成功
- ✅ Deploy Worker workflow 成功
- ✅ CI workflow 通过所有测试

### 步骤 5: 设置 Worker Secrets（首次部署后）

Worker 部署成功后，需要设置运行时 Secrets：

```bash
# 登录 Cloudflare
npx wrangler login

# 设置 Worker Secrets
echo "your-ipinfo-token" | npx wrangler secret put IPINFO_TOKEN --name browserscan-network-injector
echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY --name browserscan-network-injector
echo "$(openssl rand -base64 32)" | npx wrangler secret put PDF_SIGNING_KEY --name browserscan-network-injector
```

### 常见问题排查

**Q: GitHub Actions 报错 "Authentication error"**
A: 检查 `CLOUDFLARE_API_TOKEN` 是否正确，以及是否有足够的权限

**Q: Worker 部署成功但运行时报错 "IPINFO_TOKEN is not defined"**
A: 需要运行步骤 5 设置 Worker Secrets

**Q: Pages 部署失败 "Account ID not found"**
A: 检查 `CLOUDFLARE_ACCOUNT_ID` 是否正确配置

**Q: 如何验证 Secrets 是否正确设置？**
A:
```bash
# 列出 Worker Secrets（不显示值）
npx wrangler secret list --name browserscan-network-injector

# 测试 API Token
curl "https://api.cloudflare.com/client/v4/accounts/YOUR_CLOUDFLARE_ACCOUNT_ID/tokens/verify" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

---

## 附录 B: 快速部署检查清单

部署前请确认以下所有项目：

### GitHub 配置
- [ ] 所有 5 个 Secrets 已在 GitHub 中配置
- [ ] 所有 2 个 Variables 已在 GitHub 中配置
- [ ] GitHub Actions 已启用

### Cloudflare 资源
- [ ] D1 数据库 `browserscan-db` 已创建
- [ ] R2 存储桶 `browserscan-reports` 已创建
- [ ] R2 存储桶 `browserscan-next-cache` 已创建
- [ ] Database schema 已应用 (`drizzle/schema.sql`)
- [ ] Turnstile 站点已创建并获取密钥

### 本地验证
- [ ] `npm install` 成功
- [ ] `npm run build` 成功
- [ ] `npm run typecheck` 无错误
- [ ] `npm run lint` 无错误
- [ ] `npm run test` 全部通过

### 部署后验证
- [ ] Worker 部署成功，可以访问健康检查端点
- [ ] Pages 部署成功，可以访问主页
- [ ] 扫描功能正常工作
- [ ] PDF 生成功能正常
- [ ] 所有 API 端点返回正确响应

### 安全检查
- [ ] `.env.local` 未提交到 Git
- [ ] 所有密钥通过 Secrets 管理，未硬编码
- [ ] API Token 权限最小化（仅必需权限）
- [ ] Worker Secrets 已设置
- [ ] 公开仓库中无敏感信息泄露
