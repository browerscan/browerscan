# BrowserScan.org — 工程最佳实践手册

_版本：2025-11-27_

## 1. 质量支柱 (Quality Attributes)
- **Performance**：关键交互 (First Interaction, Report detail) P95 < 1.2s；Worker API 99p 响应 < 600ms；PDF 生成 < 3s。
- **Architectural Modularity**：apps / workers / packages 解耦；禁止跨 package 相对引用；公共类型全部来自 `@browserscan/types`。
- **Comprehensive Tests**：核心算法 & API 覆盖率 ≥ 80%；Playwright Smoke 每次 PR 必跑；Worker 通过 Miniflare 集成测试。
- **Maintainability**：单文件 < 300 行（除 schema/样本数据外）；Story/MDX 记录每个复杂组件；所有约定写进此文档或仓库 lint 规则。
- **Scalable Design Patterns**：Feature Flag + Registry 模式（如 scoring rules）；数据库 schema 仅向前兼容；采用事件/任务队列为未来多扫描器预留空间。

## 2. 执行节奏与验收
1. **Stage 0 — Bootstrap**：初始化依赖、lint 配置；运行 `npm run lint` + `npm run typecheck` 作为基线。
2. **Stage 1 — 前端特性**：每完成一个 route 视图（Dashboard/Report/Tools/...），立即运行 `npm run test --workspace apps/web`，并在 PR 描述附带截图/交互说明。
3. **Stage 2 — Worker/API**：新增 endpoint 需同时提交 Miniflare 测试 (`npm run test:worker` 预留) 与 `scripts/seed-*` 更新；记录在 `docs/STATUS.md`。
4. **Stage 3 — 数据/部署**：每次 D1 迁移先在本地 `wrangler d1 migrations apply --local`，通过后再提交；Pages & Worker 部署均需在 Actions artifact 内保留 build logs。
5. **Stage 4 — 稳定性**：完成冒烟脚本后录入 `docs/STATUS.md` + issue tracker；任何性能回归 >10% 需开独立任务。

> 规则：**每个阶段结束必须运行对应测试命令**，若因脚本限制无法运行，则在 PR / STATUS 中注明原因与代替验证手段。

## 3. 前端 (Next.js @ Cloudflare Pages)
- **渲染策略**：Dashboard 使用客户端数据流 (`useLiveReport`) + Skeleton；报告/工具页面优先采用 `generateStaticParams` + Suspense；知识库页面走 MDX + Edge Runtime。
- **数据层**：所有 fetch 通过 `QueryProvider` 注入的 React Query；`staleTime` 依据数据类型设定（扫描 15s、知识内容 24h）。
- **性能优化**：
  - 使用 `next/script` defer 三方脚本。
  - 大图/地图懒加载 (`dynamic(() => import(...), { ssr: false })`)。
  - Recharts/Framer Motion 组件拆分为 `client` 组件并搭配 `React.memo` 降噪。
- **可维护性**：
  - 组件分层：`components/sections` (页面区块)、`components/ui` (原子)、`packages/ui` (跨项目共享)。
  - 颜色/间距/动画全部引用 `DESIGN_SYSTEM.md` token；新增 token 需在文档中登记。
- **可访问性**：按钮/链接具备 `aria-label`；`StatusDot` 提供 `role="status"`；键盘陷阱在 Dialog/Tooltip 内测试。
- **PDF 与导出**：使用 `jspdf` + `html2canvas` 组合时，避免在主线程阻塞 > 200ms，需将渲染逻辑放入 `useWorkerPdf` hook（Web Worker + lazy import）。

## 4. Worker / API 层 (Cloudflare Worker + Pages Functions)
- **路由组织**：`workers/network-injector/src/worker.ts` 使用 Hono 子路由 `/api/scan`, `/api/tools`, `/api/simulation`；每个子域模块化至 `services/*`。
- **并发控制**：对外部 API (ipinfo) 采用 `Promise.race` + `AbortController`，设置 800ms 超时；失败 fallback 到缓存数据。
- **缓存策略**：使用 Cloudflare Cache API + KV (`IP_CACHE`)；key = `${ip}:${version}`，TTL 15 分钟。写缓存必须 wrap try/catch 以免阻断主流程。
- **评分引擎**：
  - `RuleRegistry` 注册 rule；rule 文件仅依赖 `@browserscan/types`。
  - 输出结构写入 D1 `scans` 时 `report_blob` 始终 `JSON.stringify(..., null, 2)`，利于调试；生产写入时可以 gzip 压缩。
- **错误处理**：统一封装 `respond(data, { status, ttl })`；错误永远返回 `status: 'error'` + 机器可解析 `code`；日志中禁止输出完整 IP，最多显示 `/24`。
- **可扩展性**：Worker 需预留 `bindings`（R2、KV、Durable Objects）；每加 1 个 binding 就在 `wrangler.toml` + `docs/DEPLOYMENT.md` 更新。

## 5. 数据层 (D1 / R2 / KV)
- **Schema 约定**：
  - `drizzle/schema.sql` 是单一事实来源；从 Drizzle 生成的迁移要与 SQL 对齐。
  - 默认添加索引：时间、评分、国家；任何新列若经常过滤必须补充索引。
- **数据质量**：扫描记录入库时校验 JSON Schema 版本 (`meta.version`)；若版本差异则触发升级逻辑把旧 schema 转换为最新结构。
- **R2 存储**：`reports/{yyyy}/{mm}/{scan_id}.pdf`；metadata 含 `score`, `grade`, `ip_country`，方便后续清理。
- **审计 & 清理**：Cron Worker 每 6 小时扫描 `scans` 表，删除 60 天前的数据，另写到 `audit.log`。

## 6. 测试体系
- **Unit**：`apps/web` 使用 Vitest，要求：
  - 每个 util/hook 1 份测试；
  - `sampleReport` 校验 deduction 排序、score 计算 (已存在)；新增逻辑需追加。
- **Integration**：Miniflare 驱动 Worker，覆盖：`/api/scan/start`, `/api/scan/:id`, `/api/tools/ip-lookup` happy path + 错误分支。
- **E2E**：Playwright 场景 `scan -> report/network -> tools/ip-lookup -> pdf export`；CI 中 nightly 运行。
- **Coverage & 报告**：阈值 80/70/70 (lines/branches/functions)；Action 上传 `coverage-report/` artifact；若未达标需在 PR 中说明豁免理由。

## 7. 监控与可观测性
- Pages 使用 Cloudflare Analytics；Worker 通过 `wrangler tail` + Logpush 到 R2。
- 指标：请求量、错误率、平均分布国家、PDF 生成耗时；将关键指标通过 `scripts/metrics-push.ts` 推送到外部监控（Grafana/Looker）。
- 设置 `health` 端点返回依赖连通性：`{ d1: 'ok', r2: 'ok', kv: 'ok', version }`；CI Smoke 测试命中该端点。

## 8. 代码评审与工作流
- PR 模板包含：影响区域、测试结果、相关文档、Rollout 计划。
- 所有 PR 需至少 1 名 Reviewer；涉及安全/隐私改动需要 2 名。
- Commit 信息格式：`feat(worker): add scoring registry`。
- 当变更影响文档，务必在 PR 中勾选“Docs updated”。

## 9. 风险与回滚
- 列表化高风险项：
  1. 外部情报 API 超时 → 立即启用缓存兜底。
  2. D1 schema 升级失败 → 使用 `wrangler d1 export` 备份回滚。
  3. Turnstile/recaptcha 故障 → 在 Worker 中提供 `SIMULATION_MODE` 环境变量，强制通过。
- 回滚流程：
  1. Pages：`wrangler pages deployment rollback`；
  2. Worker：`wrangler versions rollback`。
  3. 数据：应用上一版本 SQL 备份；确认清理 job 停止后再恢复。

> 只要遵守以上约定，BrowserScan.org 即可在性能、可维护性与安全性之间取得平衡，同时确保未来扩展（多租户、AI 分析）时平滑升级。

