# BrowserScan.org — 运维 Runbook

_版本：2025-11-27_

## 1. 服务概览
- **前端**：Next.js (Cloudflare Pages) — 静态+Edge 函数提供 `/api/*` 代理。
- **后端**：Cloudflare Worker `browserscan-worker` — 扫描编排、评分、外部 IP intelligence、PDF 上传。
- **数据**：D1 `browserscan-db`（报告）、R2 `browserscan-reports`（PDF）、KV `IP_CACHE`（情报缓存）。
- **SLO**：
  - Worker API 可用性 ≥ 99.5%。
  - 平均扫描延迟 < 2.5s；99p < 6s。
  - PDF 生成成功率 ≥ 98%。

## 2. On-Call 资源
- PagerDuty / Slack: `#browserscan-ops`（接收 Pages/Worker 告警）。
- 仓库问题模板：`Incident Report`（GitHub）。
- 监控面板：
  1. Cloudflare Analytics (Pages + Worker traffic)。
  2. 自建 Grafana（via `scripts/metrics-push.ts`）。
- 外部依赖状态页：ipinfo.io、Cloudflare Status、Turnstile Status。

## 3. 常见告警与处理
| 告警 | 侦测 | 立即操作 | 深入诊断 |
| --- | --- | --- | --- |
| **Worker 5xx > 1%** | Cloudflare Worker Analytics / Logpush | - 运行 `wrangler tail browserscan-worker`<br>- 检查最近部署 rollback ID | - 对照 `docs/RELEASE_CHECKLIST.md`，必要时执行回滚<br>- 查看 `scans` 表最近写入是否异常 |
| **Pages 4xx 增加** | Pages Analytics | - 访问 `/`，确认静态资源成功<br>- 检查 `NEXT_PUBLIC_WORKER_ORIGIN` 环境变量 | - `wrangler pages project env vars list` 验证 envs<br>- 回滚上一个部署 |
| **D1 写入失败** | 自建 metrics (`d1_write_failures`) | - 检查 `wrangler d1 execute` 是否返回错误<br>- 查看 Cloudflare Status | - 导出 D1 `wrangler d1 export` 做备份<br>- 运行 `wrangler d1 migrations list` 确认证书 |
| **PDF 生成超时** | Worker log / Grafana | - 暂时将 PDF fallback 改为直接流式（设置 `PERSIST_PDF=false`） | - 检查 R2 连接 & bucket 权限<br>- 复查 `jspdf` 渲染日志 |
| **Turnstile 验证失败** | 前端 toast + Worker log | - 使用 `SIMULATION_MODE=true` 允许跳过验证 | - 核对 Turnstile secret | `wrangler secret list` |

## 4. 故障分级
- **SEV0**：全站无法扫描、分数返回错误、D1 数据损坏 → 立即通知负责人 + Cloudflare 支持。
- **SEV1**：部分工具无法使用或 PDF 失败率 >20%。
- **SEV2**：UI 样式回退、单一外部 API 超时但有缓存。
- **SEV3**：非阻断 bug / 文案问题，记录 backlog。

## 5. 分析步骤模板
1. **确认告警**：记录时间、环境（prod/dev）、部署 ID。
2. **收集日志**：
   - `wrangler tail browserscan-worker --format pretty`。
   - Pages `wrangler pages deployment list --project-name browserscan-web`。
3. **验证依赖**：访问 `/api/health`，预期：
   ```json
   {"status":"ok","data":{"env":"prod","d1":"ok","r2":"ok","kv":"ok","version":"1.0.0"}}
   ```
4. **隔离影响**：是否仅限某地区？检查 Cloudflare 分析 geo breakdown。
5. **恢复/回滚**：依据 `docs/RELEASE_CHECKLIST.md` 中记录的 rollback ID 执行。
6. **事后总结**：
   - 在 GitHub 创建 incident issue，附：时间线、影响面、根因、行动项。
   - 更新 `docs/STATUS.md`，注明补救措施。

## 6. 常见维修脚本
- `npm run tail:worker` → 包装 `wrangler tail`。
- `scripts/seed-demo.ts` → 恢复样本数据。
- `scripts/metrics-push.ts` → 手动推送一次指标，验证监控通道可用。

## 7. 备份与恢复
- **D1**：每日 02:00 UTC 运行 `wrangler d1 export browserscan-db --file backups/YYYYMMDD.sql`；恢复时 `wrangler d1 execute browserscan-db --file backups/<date>.sql`。
- **R2**：启用 7 天版本保留；需要恢复 PDF 时下载历史版本并重新写入最新 key。
- **配置**：`wrangler.toml` + `wrangler.json` 版本控制；变更需 code review。

## 8. 变更审批
- 生产变更需 1 名 reviewer + on-call 知情。
- 高风险改动（D1 schema、评分算法）需在 `#browserscan-ops` 提前 24h 通知。

## 9. 知识转移
- 新成员 onboarding：
  1. 阅读 `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, 本 runbook。
  2. 在 staging 跑一遍 release checklist。
  3. 参与一次真正的部署 + tail session。

遵循本 runbook 可将问题定位时间控制在 15 分钟内，并确保 BrowserScan.org 维持工业级可靠性。
