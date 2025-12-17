# BrowserScan.org — 发布清单

_版本：2025-11-27_

## 1. 发布对象
- Next.js 前端（Cloudflare Pages 项目 `browserscan-web`）。
- Cloudflare Worker `browserscan-worker`（network-injector）。
- D1 数据库迁移、R2 存储策略、脚本工具（seed/metrics）。

> 凡是改动任一对象，均需完成以下 checklist；若部分步骤不适用，必须在发布 issue / PR 描述写明原因与替代验证方式。

## 2. 版本准备
1. **版本规划**
   - [ ] 语义化版本标签已创建（`vX.Y.Z`）并附带变更摘要。
   - [ ] `docs/STATUS.md` 更新了即将发布的阶段、内容与风险。
2. **代码健康**
   - [ ] `npm run lint`, `npm run typecheck`, `npm run test --workspace apps/web` 通过。
   - [ ] Worker 端 Miniflare 测试（`npm run test:worker` 预留脚本）通过。
   - [ ] Playwright 冒烟测试：`npm run test:e2e --workspace apps/web`。
   - [ ] Playwright 冒烟脚本（Dashboard → Report → Tools → PDF）运行并附截图/录像。
3. **安全 & Secrets**
   - [ ] 新增/更新的 Secrets 已写入 `wrangler secret` 与 GitHub Actions，并在 `.env.example` 记录键名。
   - [ ] gitleaks / secret lint 运行通过。

## 3. 部署前验证
1. **环境对齐**
   - [ ] `wrangler.toml` bindings 与 `docs/DEPLOYMENT.md` 描述一致（D1、R2、KV、Turnstile）。
   - [ ] Cloudflare Pages 环境变量（`TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`, 等）与 `.env.example` 对齐。
2. **数据库**
   - [ ] 若包含迁移：本地 `wrangler d1 migrations apply --local` 通过，迁移脚本已审阅。
   - [ ] `scripts/seed-demo.ts` 或其他 seed 文件更新并在 staging 验证。
3. **性能基线**
   - [ ] Lighthouse (desktop) P95 TTI < 1.2s；如超标需附追踪 issue。
   - [ ] Worker 端 `npm run bench:worker`（预留脚本）记录 99p < 600ms。

## 4. 部署执行
1. **Cloudflare Pages**
   - [ ] `npm run pages:build` 完成且产物上传到 release artifact。
   - [ ] `wrangler pages deploy` / Actions workflow 完成并标记 deployment ID。
2. **Cloudflare Worker**
   - [ ] `npm run build:worker` 生成 `dist/`；`wrangler deploy` 成功。
   - [ ] 记录版本号（`wrangler versions list`）并粘贴到发布记录。
3. **监控启用**
   - [ ] `npm run tail:worker` 观察 5 分钟无异常。
   - [ ] Cloudflare Analytics / custom dashboard 刷新，确认 traffic 开始命中新版本。

## 5. 发布后验证
1. **功能验证**
   - [ ] 实际访问 `https://browserscan.org` 完成一次扫描流程（Dashboard → Report → Tools → PDF）。
   - [ ] 检查 `/api/health` 返回 `version`, `d1`, `r2`, `kv` 均为 `ok`。
2. **数据校验**
   - [ ] D1 `SELECT count(*) FROM scans WHERE created_at > deploy_time - 10min;` 返回值合理。
   - [ ] 如果开启 R2 持久化，确认最新 PDF 对象 metadata `score`、`grade` 写入正确。
3. **回滚计划**
   - [ ] 记录 Pages & Worker 的 rollback ID。
   - [ ] 如监控出现异常，执行 `wrangler pages deployment rollback` / `wrangler versions rollback`，并更新 incident 记录。

## 6. 发布记录模板
```
Date (PT): 2025-11-27
Release Captain: <name>
Artefacts: Pages deployment <id>, Worker version <id>, D1 migration <id>
Tests: lint ✅, typecheck ✅, vitest ✅, miniflare ✅, playwright ✅
Notes: e.g. Enabled new scoring registry
Backout Plan: rollback IDs + D1 snapshot path
```

完成清单后，将其附在 PR / issue / Notion 页面，并把链接添加到 `docs/STATUS.md` 相关迭代条目中，确保审计跟踪。
