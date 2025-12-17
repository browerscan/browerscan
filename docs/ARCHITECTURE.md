# BrowserScan.org — 系统架构白皮书

_版本：2025-11-27_

## 1. 总览
BrowserScan.org 采用 **Cloudflare 全家桶 + Next.js** 组合：
- **前端**：Next.js App Router → Cloudflare Pages 静态托管。
- **边缘层**：Cloudflare Workers 负责网络指纹采集、评分、D1 写入、R2 上传。
- **数据层**：Cloudflare D1 (结构化报告)、R2 (PDF)、KV/Cache (速率限制 & 缓存)。
- **安全层**：Cloudflare Turnstile、人机验证模拟、严格 secrets 管理。

```
[Browser Client]
    │ fetch /api/*
    ▼
[Cloudflare Pages Function proxy]
    │ Durable fetch to Worker
    ▼
[Cloudflare Worker "network-injector"]
    ├─► External IP Intel APIs (ipinfo batch, etc)
    ├─► WebRTC assist services / STUN relays
    ├─► Cloudflare D1 (scans table)
    ├─► Cloudflare R2 (PDF artifacts)
    └─► Turnstile verify endpoint
```

## 2. 模块拆分
| 区域 | 技术 | 责任 |
| --- | --- | --- |
| `apps/web` | Next.js, Tailwind, Shadcn | UI、Bento Grid 布局、PDF 触发、工具页 |
| `workers/network-injector` | TypeScript Worker, Wrangler | 接收扫描请求、调用外部服务、执行评分、写入 D1/R2 |
| `packages/types` | TypeScript | JSON schema + 类型共享、Zod 校验 |
| `packages/ui` (可选) | Radix + Shadcn | 可复用组件：Card/StatusDot/HealthRing |
| `drizzle` | Drizzle Kit | D1 表结构、迁移、种子数据 |
| `scripts` | Node CLI | 数据导入、PDF 离线渲染、批量扫描工具 |

## 3. 关键数据流
1. **扫描流程**
   1. 浏览器调用 `/api/scan/start`。
   2. Pages Function 将请求转发到 Worker，Worker 生成 `scan_id`，记录基础 meta，返回 `poll_url`。
   3. 浏览器上传指纹原始数据 (`/api/scan/collect`)：WebRTC IP、Canvas hash、UA 等。
   4. Worker 汇总：获取 Cloudflare `request.cf`、调用 IP 情报、执行评分、写 D1，返回最终报告 JSON。
   5. 前端渲染 Dashboard/Report 并允许导出 PDF。

2. **PDF 导出**
   - 前端调用 `/api/report/:id/pdf`。
   - Worker 从 D1 读取 `report_blob`，通过 jsPDF/HTML 渲染为二进制。
   - 如果 `persist=true`，上传到 R2 (`reports/{scan_id}.pdf`)，返回临时签名 URL；否则直接流式返回。

3. **工具/模拟**
   - 所有 `/tools`、`/simulation` 页面调用 Worker 子路由，确保敏感逻辑都在边缘执行。

## 4. 数据结构
- **D1**：`scans`（给定 schema），后续可扩展 `simulation_runs`, `pdf_exports`。
- **R2**：桶 `browserscan-reports`，对象 key `reports/{yyyy}/{mm}/{scan_id}.pdf`。保存时间 30 天，由 Cron Worker 清理。
- **KV/Cache**：可选 `ip-cache`，缓存 ipinfo 结果 15 min 减少外部请求。

## 5. Worker 层设计
- 入口 `src/worker.ts`: 使用 `itty-router` 或 `hono` 实现 REST。
- 中间件：
  - `authMiddleware`：校验 Turnstile Token / API key（内部工具使用）。
  - `rateLimiter`：KV-based token bucket per IP。
  - `schemaValidator`：zod 校验输入。
- 服务模块：
  - `ipIntelService`
  - `webrtcLeakService`
  - `portScanService`
  - `scoringService`
  - `pdfService`
- 逆依赖管理：通过 `context` 注入 D1、R2、ENV。

## 6. 前端架构
- Layout with `app/(pages)/...` directories, route groups for `/report`, `/simulation`, `/tools`, `/knowledge`。
- Global providers：Theme (dark enforced)、Query Client（TanStack Query 用于轮询 `scan_id`）、Toast。
- Components:
  - `HealthRing` (SVG + `framer-motion`/`recharts`)
  - `KeyValueCard`
  - `StatusDot`
  - `ScanConsole` (1.5s loading animation)
  - `JsonCodeBlock`
- 数据获取：
  - `useScan` hook -> `react-query` polling
  - `useReportSection` for subsections
- SEO：Next.js Metadata API + OG image generator (Edge runtime) depicting score ring。

## 7. API 设计
| Endpoint | Method | 描述 |
| --- | --- | --- |
| `/api/scan/start` | POST | 创建扫描任务，返回 `scan_id`、估计完成时间 |
| `/api/scan/:id` | GET | 获取扫描结果（progress + report）|
| `/api/scan/:id/pdf` | POST | 生成/获取 PDF |
| `/api/tools/ip-lookup` | POST | 多源 IP 查询 |
| `/api/tools/leak-test` | POST | 检测结果写入 D1（可选）|
| `/api/simulation/recaptcha` | POST | 生成/保存模拟分数 |
| `/api/simulation/turnstile` | POST | Turnstile 验证代理 |
| `/api/knowledge/*` | GET | 返回静态 Markdown/MDX 内容（可预渲染）|

## 8. 性能 & 可扩展性
- **前端**：
  - SSG + Islands for heavy visuals；懒加载地图、可视化模块。
  - `prefers-reduced-motion` 检测，禁用动画。
- **Worker**：
  - 使用 `Promise.allSettled` 并发外部 API；超时 fallback；重试策略（指数退避）。
  - 响应缓存 `Cache API`（对 `/knowledge` 等静态端点）。
- **数据库**：
  - 批量写 D1 采用事务；report blob 压缩（`gzip`/`brotli`）。
  - D1 查询添加过滤 + 分页 (`limit/offset` or `cursor`).

## 9. 安全策略
- 所有 secrets 通过 `wrangler secret` & GitHub Actions encrypted secrets；`.env.example` 仅列键名。
- Worker 响应中对 IP 地址默认脱敏（前端 hover 显示）。
- 速率限制 + Turnstile 防止滥用。
- PDF 下载链接短期有效，带 HMAC 签名。
- 日志处理：生产日志写入 Cloudflare Logpush Bucket，仅输出匿名化信息。

## 10. 测试策略
- **单元**：scoring rules、JSON schema 解析、utility 函数。
- **集成**：Miniflare 模拟 Worker，测试 `/api/scan` happy path + 错误。
- **E2E**：Playwright 脚本跑 Dashboard → Report → Tools → PDF。
- **回归**：GitHub Actions pipeline运行 `npm test`, `npm run lint`, `npm run typecheck`, `npm run build:web`。

## 11. 运维 & 监控
- 使用 Cloudflare Analytics 观察 Pages/Workers traffic。
- 自建 `/api/health` 返回 D1/R2/KV 连通状态。
- Cron trigger `0 */6 * * *`：清理过期扫描、删除旧 PDF、刷新缓存。
- 事故应急：文档化 rollback（git revert + `wrangler rollback`）。

## 12. Roadmap 升级点
- 多租户：`account_id` 概念 + RBAC。
- 审计日志：记录每次报告访问。
- 第三方集成：将 JSON 结果推送到 Slack/Webhook。
- AI 分析：使用 LLM 生成自然语言解读（需额外 API）。

