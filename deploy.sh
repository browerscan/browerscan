#!/bin/bash

# 部署脚本 - BrowserScan.org 到 Cloudflare
# 使用前请确保已完成 DEPLOYMENT_STATUS.md 中列出的手动步骤

set -e  # 遇到错误时退出

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}BrowserScan.org 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 设置环境变量 - NEVER commit these values!
# Load from .env file or set manually
if [ -f ".env" ]; then
    source .env
fi

# Verify required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}ERROR: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set${NC}"
    echo "Set them in .env file or export them manually"
    exit 1
fi

export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

# 检查是否已启用 R2
echo -e "${YELLOW}步骤 1: 检查 R2 状态...${NC}"
if npx wrangler r2 bucket list &> /dev/null; then
    echo -e "${GREEN}✓ R2 已启用${NC}"
else
    echo -e "${RED}✗ R2 未启用${NC}"
    echo -e "${YELLOW}请访问以下链接启用 R2:${NC}"
    echo "https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/r2"
    exit 1
fi

# 创建 R2 buckets
echo -e "\n${YELLOW}步骤 2: 创建 R2 buckets...${NC}"

if npx wrangler r2 bucket list | grep -q "browserscan-reports"; then
    echo -e "${GREEN}✓ browserscan-reports 已存在${NC}"
else
    echo "创建 browserscan-reports..."
    npx wrangler r2 bucket create browserscan-reports
    echo -e "${GREEN}✓ browserscan-reports 创建成功${NC}"
fi

if npx wrangler r2 bucket list | grep -q "browserscan-next-cache"; then
    echo -e "${GREEN}✓ browserscan-next-cache 已存在${NC}"
else
    echo "创建 browserscan-next-cache..."
    npx wrangler r2 bucket create browserscan-next-cache
    echo -e "${GREEN}✓ browserscan-next-cache 创建成功${NC}"
fi

# 取消 R2 配置注释
echo -e "\n${YELLOW}步骤 3: 更新 wrangler.toml...${NC}"
if grep -q "^# \[\[r2_buckets\]\]" workers/network-injector/wrangler.toml; then
    sed -i.bak 's/^# \(\[\[r2_buckets\]\]\)/\1/' workers/network-injector/wrangler.toml
    sed -i.bak 's/^# \(binding = "REPORTS_BUCKET"\)/\1/' workers/network-injector/wrangler.toml
    sed -i.bak 's/^# \(bucket_name = "browserscan-reports"\)/\1/' workers/network-injector/wrangler.toml
    echo -e "${GREEN}✓ R2 配置已启用${NC}"
else
    echo -e "${GREEN}✓ R2 配置已经启用${NC}"
fi

# 构建 Worker
echo -e "\n${YELLOW}步骤 4: 构建 Worker...${NC}"
npm run build:worker
echo -e "${GREEN}✓ Worker 构建成功${NC}"

# 部署 Worker
echo -e "\n${YELLOW}步骤 5: 部署 Worker...${NC}"
cd workers/network-injector
npx wrangler deploy --env=""
echo -e "${GREEN}✓ Worker 部署成功${NC}"
cd ../..

# 提示设置 Secrets
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}下一步: 设置 Worker Secrets${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "请运行以下命令设置 Worker 密钥:"
echo ""
echo "# 1. IPINFO_TOKEN (从 ipinfo.io 获取)"
echo 'echo "your-ipinfo-token" | npx wrangler secret put IPINFO_TOKEN --name browserscan-network-injector'
echo ""
echo "# 2. TURNSTILE_SECRET_KEY (从 Cloudflare Turnstile 获取)"
echo 'echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY --name browserscan-network-injector'
echo ""
echo "# 3. PDF_SIGNING_KEY (自动生成)"
echo 'echo "$(openssl rand -base64 32)" | npx wrangler secret put PDF_SIGNING_KEY --name browserscan-network-injector'
echo ""

# 构建和部署 Pages
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}部署 Pages (可选)${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "如果需要手动部署 Pages，运行:"
echo "cd apps/web"
echo "npm run pages:build"
echo "npx wrangler pages deploy .open-next/assets --project-name=browserscan-web"
echo ""
echo "或者推送到 GitHub，让 GitHub Actions 自动部署"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署脚本完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "查看部署状态: DEPLOYMENT_STATUS.md"
echo "完整文档: docs/DEPLOYMENT.md"
