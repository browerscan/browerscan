# BrowserScan.org (权威版) — 项目实施方案

_最后更新：2025-11-27（UTC-8）_

## 1. 项目愿景 & 核心目标
- 构建“BrowserScan.org”权威版：提供浏览器/网络指纹体检 + 风险评分 + PDF 报告的工业级体验。
- 交付 Cloudflare 全家桶解决方案：Next.js@Cloudflare Pages、Worker 网络指纹注入、D1 数据、R2 PDF 存储、Turnstile 模拟、自动化部署。
- 打造可扩展数据协议（JSON Schema + D1 结构），满足未来 API/合作方扩展需求。
- 提供高信息密度、赛博工业风 UI，实现可视化、交互、报告的一致体验。

## 2. 工作分解结构（WBS）
1. 项目启动
   - 1.1 仓库初始化、约定包管理（npm）与 Node 版本。
   - 1.2 参考资产审阅（`amiunique.io`, `creepjs`, `iphey`, `whatismytimezone`）。
   - 1.3 `.env.example`、安全策略草拟。
2. 架构设计
   - 2.1 前端（Next.js App Router、Tailwind、Shadcn、Geist 字体）。
   - 2.2 Worker/API 层（Cloudflare Worker + Pages Functions 协同）。
   - 2.3 数据层（Cloudflare D1 schema + drizzle adapter + R2 bucket）。
   - 2.4 外部服务集成（IP intelligence、JA3 库、Turnstile、reCAPTCHA mock）。
3. 功能开发（按 Sitemap）
   - 3.1 `/` Dashboard：Health Ring、Identity、Risk Board、Actions。
   - 3.2 `/report/*` 深度分析 + 一致性板块。
   - 3.3 `/simulation/*` Bot Detection Lab。
   - 3.4 `/tools/*` 专业工具箱。
   - 3.5 `/knowledge/*` 内容页。
4. 数据协议 & 评分逻辑
   - 4.1 JSON schema 定稿、类型定义共享。
   - 4.2 Scoring engine（扣分表 + grade 区间）。
   - 4.3 数据写入/查询 D1，report blob -> R2。
5. PDF 报告 & 导出
   - 5.1 jsPDF 模板（白底）、条形码/Logo。
   - 5.2 Worker 端 PDF 生成（可选 S3/R2 存储）。
6. CI/CD & 部署
   - 6.1 Wrangler 配置、Bindings、Secret 管理。
   - 6.2 Cloudflare Pages 自动部署、Workers 发布。
   - 6.3 GitHub Actions（CI + Pages + Worker pipelines）。
7. QA & 验证
   - 7.1 单元/集成测试（Vitest/Playwright）。
   - 7.2 端到端 Smoke 测试场景（扫描->报告->PDF）。
   - 7.3 安全审查（敏感信息、API key 保护）。
8. 文档 & 交付
   - 8.1 `docs/` 文档体系（Implementation Plan、Architecture、Design System、Deployment、Status、Engineering Best Practices）。
   - 8.2 发布清单、运维 runbook（`docs/RELEASE_CHECKLIST.md`, `docs/OPERATIONS_RUNBOOK.md`）。
   - 8.3 项目总结。

## 3. 技术架构总览
```
[Client Next.js (Cloudflare Pages)]  <->  [/api/* (Pages Functions proxy)]  <->  [Cloudflare Worker "network-injector"]
                                                                                   |-- D1 (scans, logs)
                                                                                   |-- R2 (pdf reports)
                                                                                   |-- Turnstile / reCAPTCHA mocks
                                                                                   '-- External IP intel (ipinfo, etc)
```
- **渲染模式**：Next.js 静态导出 + 交互由客户端调用 Worker API。
- **数据流**：浏览器 -> Pages `/api/scan` -> Worker 注入 `request.cf` / 指纹检测 -> 写 D1 -> 返回 JSON -> 前端渲染 -> 可导出 PDF -> （可选）PDF URI 写 R2。
- **共享类型**：`packages/types` 存放 `ScanReport`, `Score`, `Identity`, `Risk` 等 TypeScript 类型，供 Worker + Frontend 复用。
- **安全边界**：所有敏感 token 存 `wrangler secret` 与 GitHub Actions secrets；客户端永不直接调用外部 IP API。

## 4. 仓库结构（建议）
```
BrowserScan.org/
├── apps/
│   └── web/                # Next.js 前端（Cloudflare Pages）
├── workers/
│   └── network-injector/   # Cloudflare Worker + Tests
├── packages/
│   ├── types/              # JSON schema + TS 类型
│   └── ui/                 # 共享 UI 组件（Shadcn 扩展，可选）
├── drizzle/                # D1 schema & migrations
├── scripts/                # 数据种子、PDF 工具、lint 脚本
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── ARCHITECTURE.md      (待写)
│   ├── DESIGN_SYSTEM.md     (待写)
│   ├── DEPLOYMENT.md        (待写)
│   └── STATUS.md            (待写，跟踪进度)
└── package.json            # workspace 根
```

## 5. 外部资产复用 & 研究计划
- **`amiunique.io`, `creepjs`, `iphey`**：提取指纹检测逻辑/算法参考，整理可直接使用的 JS snippet 或数据映射。
- **`whatismytimezone` 项目**：
  - 参考 `DEPLOYMENT.md`, `CLOUDFLARE_DEPLOYMENT_GUIDE.md`, GitHub Actions 模板、Cloudflare 配置策略。
  - 复用成功的 ESLint/Vitest/CI 约定，保持组织一致性。
- **IP Intelligence**：`https://ipinfo.io/batch?token=74c58de120b25f` 用于批量查询，需实现 Worker-side throttle + 缓存。
- **数据集**：`/Volumes/SSD/dev/new/ip-dataset/*` 目录作为模拟数据源，构建开发期样本以验证评分逻辑。

## 6. 功能规划（按站点导航）
### 6.1 `/` Dashboard
- **Health Ring**：SVG + Recharts；颜色映射（<50 红、50-79 黄、≥80 绿），加载动画1.5秒。
- **Identity 卡片**：IP/ASN/Browser/OS/Device，值采用 `font-mono`，含 Copy 图标（无障碍 aria label）。
- **Risk Board**：WebRTC Leak、Proxy Detect、Timezone mismatch、Bot check，使用 Status Dot 组件，危险状态 `animate-ping`。
- **Actions**：PDF 导出、分享链接、重新扫描 —— 调用 Worker API。
- **Scan Simulation**：进入页面自动触发 `/api/scan/start` -> Worker 产生 `scan_id` -> 轮询 `/api/scan/:id`。

### 6.2 `/report` 系列
- **Layout**：左侧固定导航，右侧内容 scroll； sticky CTA（导出 PDF）。
- **/report/network**：IP intelligence、JA3/JA4、TLS、HTTP 版本、TCP OS 预测、Leak 状态表； code-block 样式 JSON 视图。
- **/report/hardware**：Canvas/WebGL/Audiocontext/Battery/Screen；展示 hash + 原始值 + 风险提示。
- **/report/software**：Fonts list（折叠）、Navigator 指标、Plugins、Concurrency/Memory。
- **/report/consistency**：测试用例表格（Timezone, Language, OS），显示 PASS/FAIL/WARN，展开 Diff。

### 6.3 `/simulation`
- **/simulation/recaptcha**：模拟 score slider (0.1-0.9) + 历史记录（D1）。
- **/simulation/turnstile**：集成 Cloudflare Turnstile widget + Worker 端验证。
- **/simulation/behavior**：记录鼠标轨迹（canvas）、点击熵、停留时间 -> Worker 评估。

### 6.4 `/tools`
- **/tools/ip-lookup**：输入 IP -> Worker 调用外部 API，多源结果并列展示（ipinfo, internal cache）。
- **/tools/leak-test**：WebRTC/DNS/IPv6 检测（worker + STUN trick）。
- **/tools/port-scan**：限制端口集合（22,80,443,3389,8080），显示开放状态 + 风险提示。
- **/tools/pdf-gen**：手动生成当前环境扫描 PDF。
- **/tools/cookie-check**：解析 `document.cookie` + `cookieStore` API，展示 Secure/HttpOnly/SameSite。

### 6.5 `/knowledge`
- **methodology**：评分算法、检测原理、数据来源；支持 TOC；可由 MDX 驱动。
- **privacy**：数据处理、保留策略、Turnstile 说明；发布版本号 & 更新日期。

## 7. 数据协议 & 类型共享
- `packages/types/src/scan.ts`：导出 `ScanMeta`, `ScoreCard`, `IdentitySnapshot`, `NetworkSection`, `LeakStatus`, `FingerprintSection`, `ConsistencyCheck`。
- 使用 `zod` / `valibot` 校验 Worker 输入输出，Next.js 端推断类型。
- JSON Schema 版本字段 `meta.version`，Worker 通过 `Accept-Version` header 控制灰度。
- `report_blob` 存 JSON 字符串（压缩/加密可选），R2 key 命名 `reports/{scan_id}.pdf`。

## 8. 评分算法实现细节
- **Grade 区间**：A+ ≥ 97，A 90-96，B 80-89，C 65-79，F < 65。
- **Deduction Engine**：
  - 输入：`ScanContext`（来自 Worker），包含 risk flags、leak 结果、bot 指标。
  - 规则模块化：每个 rule 描述 `id`, `predicate`, `deduction`, `severity`, `message`。
  - 输出：总分、等级、`deductions[]`（按分值排序），同时记录 `affected_sections` 供 UI 高亮。
  - 预留扩展：`RuleRegistry` 支持动态加载/feature flags。

## 9. 基础设施配置
- **Cloudflare D1**：
  - `wrangler d1 create browserscan-db`
  - `drizzle-kit` + `schema.sql` 同步。
  - 索引：`created_at`, `trust_score`, `country_code`（已给）。
- **R2**：
  - Bucket: `browserscan-reports`
  - Worker binding `R2_BUCKET`
  - Access via signed URL for downloads。
- **Workers/Pages**：
  - `wrangler.toml` root：定义 durable objects (port scan?), D1/R2 bindings, env vars (API tokens, TURNSTILE_SECRET)。
  - Pages project `browserscan-web`：build command `npm run build:web`, output `.vercel/output/static` or `.next/static` depending on adapter。
- **Turnstile**：
  - Site key/secret key via `.env.local` → `wrangler secret`。
  - Worker 验证 endpoint `/api/turnstile/verify`。

## 10. Dev Workflow & 工具
- **Package Manager**：npm（锁定 `package-lock.json`）。
- **Lint/Format**：ESLint (Next.js preset + security rules) + Prettier + Tailwind plugin。
- **Testing**：Vitest (units), Playwright (E2E)；Worker 使用 Miniflare 测试。
- **Storybook**：可选，用于 UI 组件调试，部署到 Cloudflare Pages preview。
- **Git Hooks**：Husky + lint-staged（可选）。
- **Logging**：Worker 使用 `console.log` + Logpush integration plan；Next.js 端 minimal logging。

## 11. 进度跟踪机制
- 创建 `docs/STATUS.md`（每日/每阶段更新：日期、完成项、阻塞、下一步）。
- PR 模板包含“影响区域 + 测试 + 文档更新”核对表。
- 关键里程碑：
  1. **M1**（Day 2）：Repo scaffold、CI、D1 schema、基础 Worker stub。
  2. **M2**（Day 5）：Dashboard + scan API MVP，评分逻辑跑通。
  3. **M3**（Day 8）：report/simulation/tools 页面可用，PDF 导出初版。
  4. **M4**（Day 10）：CI/CD + Cloudflare 部署上线，文档齐全。
- 所有重要设计决策写入 `docs/ARCHITECTURE.md`，UI 规范写入 `docs/DESIGN_SYSTEM.md`。

## 12. 安全与合规
- `.env.local` 永不提交，`.env.example` 仅列出键名。
- GitHub Actions 使用 OIDC/短期 token；Secrets：`CF_API_TOKEN`, `CF_ACCOUNT_ID`, `TURNSTILE_SECRET`, `IPINFO_TOKEN`。
- Worker 对外 API 做速率限制（per IP 60 req/min）；D1 存储脱敏 IP（hash+salt）。
- PDF 下载需要带签名 `token`（有效期 5 min）。
- 数据保留策略：扫描记录默认 30 天，超期清理 job（Workers Cron Trigger）。

## 13. 风险评估 & 备选方案
| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 外部 IP API 限流/失败 | 扫描结果不完整 | 实现缓存 + 退化数据 + “数据延迟”提示 |
| WebRTC/Port scan 浏览器限制 | 检测准确性下降 | 采用 service worker/stun fallback，标记“部分支持” |
| Cloudflare Worker 计算/存储限制 | 评分/报告失败 | 拆分 Worker（injector + pdf），将重任务迁移到 Durable Object |
| PDF 生成体积大 | 超过 R2 限制或延迟大 | 限制报告页数，按需生成，清理旧文件 |
| 公共仓库泄露配置 | 安全事故 | 强制 secret lint、pre-commit 检测、review checklist |

## 14. 验收标准
- 功能覆盖：Sitemap 所列所有页面可访问且具备核心交互。
- 评分逻辑：与表格规则一致，覆盖所有 deduction 项并可扩展。
- 数据一致性：Worker → D1 → 前端 → PDF 完整链路经过至少 3 轮真实扫描测试。
- UI：符合“Cyber-Industrial”指南；Health Ring、Status Dot、Bento Grid 达标。
- 文档：`docs/` 包含实施方案、架构、部署、设计系统、状态、API 参考。
- CI/CD：GitHub Actions 通过，Cloudflare Pages/Worker 自动部署成功，Secrets 未泄露。

## 15. 下一步行动
1. 审核本实施方案，如需补充/修改请批注。
2. 确认仓库结构 & 包管理策略。
3. 拉取 Cloudflare/GitHub 凭据（线下），准备 `.env.local`。
4. 开始进入编码阶段（从仓库 scaffold + 文档基线入手）。
