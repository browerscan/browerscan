# 🚀 BrowserScan.org - Quick Start Guide

快速启动本地开发环境的指南。

## 📋 前置要求

```bash
node --version  # v20.x 或更高
npm --version   # v10.x 或更高
```

## 🔧 快速启动步骤

### 1. 安装依赖

```bash
cd /Volumes/SSD/dev/new/ip-dataset/BrowserScan.org
npm install
```

### 2. 环境变量已配置 ✅

以下文件已自动创建：

- ✅ `apps/web/.env.local` - 前端环境变量
- ✅ `workers/network-injector/.dev.vars` - Worker 环境变量

**配置说明**:
- `NEXT_PUBLIC_WORKER_ORIGIN=http://localhost:8787` - Worker 本地地址
- `IPINFO_TOKEN=` - 可选，留空使用 fallback 数据
- `TURNSTILE_SECRET_KEY=` - 可选，留空使用手动模式

### 3. 启动开发服务器

**选项 A: 同时启动前端和 Worker (推荐)**

```bash
npm run dev
```

这会并发启动：
- 前端: http://localhost:3000
- Worker: http://localhost:8787

**选项 B: 分别启动**

终端 1 - 启动 Worker:
```bash
cd workers/network-injector
npm run dev
```

终端 2 - 启动前端:
```bash
cd apps/web
npm run dev
```

### 4. 访问应用

打开浏览器访问: **http://localhost:3000**

✅ Edge API 状态应该显示为 "Connected" (绿色)

## 🧪 验证安装

### 测试 Worker 健康检查

```bash
curl http://localhost:8787/api/health
```

预期输出:
```json
{
  "status": "ok",
  "data": {
    "env": "development",
    "version": "1.0.0",
    "timestamp": 1234567890
  }
}
```

### 测试前端

1. 访问 http://localhost:3000
2. 应该看到信任评分环开始分析
3. 几秒钟后显示 0-100 的分数
4. 点击 "View Detailed Report" 查看详细报告

### 测试 IP 查询工具

```bash
curl -X POST http://localhost:8787/api/tools/ip-lookup \
  -H "Content-Type: application/json" \
  -d '{"ip":"8.8.8.8"}'
```

## 🔑 获取可选 API 密钥

### IPInfo.io Token (推荐)

1. 访问 https://ipinfo.io/signup
2. 注册免费账号 (50,000 请求/月)
3. 复制 Access Token
4. 编辑 `workers/network-injector/.dev.vars`:
   ```
   IPINFO_TOKEN=your_token_here
   ```
5. 重启 Worker: `npm run dev`

### Cloudflare Turnstile (可选)

1. 访问 https://dash.cloudflare.com/
2. 选择 Turnstile
3. 创建新站点，选择 "Managed" 模式
4. 复制 Site Key 和 Secret Key
5. 编辑配置文件:

   `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
   ```

   `workers/network-injector/.dev.vars`:
   ```
   TURNSTILE_SECRET_KEY=your_secret_key
   ```
6. 重启应用

## 🛠️ 常用命令

```bash
# 开发
npm run dev              # 并发启动前端和 Worker
npm run dev:web          # 仅启动前端
npm run dev:worker       # 仅启动 Worker

# 构建
npm run build            # 构建所有项目
npm run build:web        # 仅构建前端
npm run build:worker     # 仅构建 Worker

# 测试
npm run test             # 运行所有测试
npm run test:worker      # 运行 Worker 单元测试
npm run test:e2e         # 运行 E2E 测试

# 类型检查
npm run typecheck        # TypeScript 类型检查

# 代码检查
npm run lint             # ESLint 检查
```

## 📁 项目结构

```
BrowserScan.org/
├── apps/
│   └── web/                    # Next.js 前端应用
│       ├── src/
│       │   ├── app/           # App Router 页面
│       │   ├── components/    # React 组件
│       │   └── lib/          # 工具函数和 hooks
│       └── .env.local         # ✅ 前端环境变量
│
├── workers/
│   └── network-injector/       # Cloudflare Worker API
│       ├── src/
│       │   ├── worker.ts      # 主 Worker 文件
│       │   └── services/      # 服务模块
│       ├── .dev.vars          # ✅ Worker 环境变量
│       └── wrangler.toml      # Worker 配置
│
├── packages/
│   └── types/                  # 共享 TypeScript 类型
│
├── docs/                       # 📚 文档
│   ├── QUICK_START.md         # 本文件
│   ├── PRODUCTION_DEPLOYMENT.md
│   └── PROJECT_COMPLETION_SUMMARY.md
│
└── drizzle/
    └── schema.sql              # D1 数据库 schema
```

## ❓ 常见问题

### Q: Edge API 显示 "Unreachable"

**A**: 确保以下两点：
1. ✅ Worker 正在运行 (http://localhost:8787)
2. ✅ `.env.local` 文件存在且配置正确

验证 Worker:
```bash
curl http://localhost:8787/api/health
```

### Q: Worker 启动失败

**A**: 检查端口 8787 是否被占用：
```bash
lsof -i :8787
# 如果被占用，终止进程或修改 wrangler.toml 中的端口
```

### Q: 前端连接 Worker 失败 (CORS 错误)

**A**: Worker 已配置 CORS，确保：
1. Worker 正在运行
2. `NEXT_PUBLIC_WORKER_ORIGIN` 设置为 `http://localhost:8787`
3. 重启前端应用

### Q: 数据库查询失败

**A**: 本地开发使用内存数据库：
```bash
cd workers/network-injector
wrangler d1 execute browserscan-db --local --file=../../drizzle/schema.sql
```

### Q: 需要真实 IP 数据

**A**: 配置 `IPINFO_TOKEN`：
1. 注册 https://ipinfo.io/signup
2. 复制 token 到 `.dev.vars`
3. 重启 Worker

## 🎯 下一步

- 📖 查看 [生产部署指南](./PRODUCTION_DEPLOYMENT.md)
- 🧪 运行测试: `npm run test`
- 🔍 查看 [项目完成总结](./PROJECT_COMPLETION_SUMMARY.md)
- 🎨 创建 OG 图片: 参考 [OG Image Guide](./OG_IMAGE_GUIDE.md)

## 📞 获取帮助

- **项目文档**: `docs/` 目录
- **Cloudflare 文档**: https://developers.cloudflare.com
- **Next.js 文档**: https://nextjs.org/docs

---

**快速启动完成！** 🎉

现在你可以开始开发了。Edge API 应该显示为连接状态 (绿色)。
