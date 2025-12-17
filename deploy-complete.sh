#!/bin/bash

# BrowserScan.org 完整部署脚本
# 自动化 Cloudflare 部署流程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     BrowserScan.org - Cloudflare 自动部署脚本        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

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

# 验证认证
echo -e "${YELLOW}[1/8] 验证 Cloudflare 认证...${NC}"
if npx wrangler whoami &> /dev/null; then
    echo -e "${GREEN}✓ 认证成功${NC}"
else
    echo -e "${RED}✗ 认证失败${NC}"
    exit 1
fi

# 检查 R2 状态
echo -e "\n${YELLOW}[2/8] 检查 R2 状态...${NC}"
if npx wrangler r2 bucket list &> /dev/null; then
    echo -e "${GREEN}✓ R2 已启用${NC}"
    R2_ENABLED=true
else
    echo -e "${RED}✗ R2 未启用${NC}"
    echo -e "${YELLOW}请访问以下链接启用 R2（需要 1 分钟）：${NC}"
    echo "https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/r2"
    echo ""
    read -p "启用 R2 后按 Enter 继续，或按 Ctrl+C 退出... "
    R2_ENABLED=false
fi

# 创建 R2 buckets
if [ "$R2_ENABLED" = true ]; then
    echo -e "\n${YELLOW}[3/8] 创建 R2 buckets...${NC}"

    if npx wrangler r2 bucket list 2>/dev/null | grep -q "browserscan-reports"; then
        echo -e "${GREEN}✓ browserscan-reports 已存在${NC}"
    else
        npx wrangler r2 bucket create browserscan-reports
        echo -e "${GREEN}✓ browserscan-reports 创建成功${NC}"
    fi

    if npx wrangler r2 bucket list 2>/dev/null | grep -q "browserscan-next-cache"; then
        echo -e "${GREEN}✓ browserscan-next-cache 已存在${NC}"
    else
        npx wrangler r2 bucket create browserscan-next-cache
        echo -e "${GREEN}✓ browserscan-next-cache 创建成功${NC}"
    fi

    # 启用 R2 配置
    echo -e "\n${YELLOW}更新 wrangler.toml 启用 R2...${NC}"
    sed -i.bak 's/^# \(\[\[r2_buckets\]\]\)/\1/' workers/network-injector/wrangler.toml
    sed -i.bak 's/^# \(binding = "REPORTS_BUCKET"\)/\1/' workers/network-injector/wrangler.toml
    sed -i.bak 's/^# \(bucket_name = "browserscan-reports"\)/\1/' workers/network-injector/wrangler.toml
    rm -f workers/network-injector/wrangler.toml.bak
    echo -e "${GREEN}✓ R2 配置已启用${NC}"
else
    echo -e "\n${YELLOW}[3/8] 跳过 R2 buckets 创建（R2 未启用）${NC}"
fi

# 检查 workers.dev 子域名
echo -e "\n${YELLOW}[4/8] 检查 workers.dev 子域名...${NC}"
echo -e "${YELLOW}请确保已注册 workers.dev 子域名${NC}"
echo "访问: https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/workers/onboarding"
echo ""
read -p "已注册子域名后按 Enter 继续，或按 Ctrl+C 退出... "

# 构建 Worker
echo -e "\n${YELLOW}[5/8] 构建 Worker...${NC}"
npm run build:worker
echo -e "${GREEN}✓ Worker 构建成功${NC}"

# 部署 Worker
echo -e "\n${YELLOW}[6/8] 部署 Worker...${NC}"
cd workers/network-injector
npx wrangler deploy --env=""
echo -e "${GREEN}✓ Worker 部署成功${NC}"
cd ../..

# 获取 Worker URL
WORKER_URL=$(cd workers/network-injector && npx wrangler deployments list --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")
if [ -n "$WORKER_URL" ]; then
    echo -e "${GREEN}Worker URL: ${WORKER_URL}${NC}"
fi

# 设置 Worker Secrets
echo -e "\n${YELLOW}[7/8] 设置 Worker Secrets...${NC}"
echo -e "${YELLOW}请准备以下密钥：${NC}"
echo ""

# IPINFO_TOKEN
echo "1. IPINFO_TOKEN (从 https://ipinfo.io/account/token 获取)"
read -p "请输入 IPINFO_TOKEN（或按 Enter 跳过）: " IPINFO_TOKEN
if [ -n "$IPINFO_TOKEN" ]; then
    echo "$IPINFO_TOKEN" | npx wrangler secret put IPINFO_TOKEN --name browserscan-network-injector
    echo -e "${GREEN}✓ IPINFO_TOKEN 已设置${NC}"
fi

# TURNSTILE_SECRET_KEY
echo ""
echo "2. TURNSTILE_SECRET_KEY (从 Cloudflare Turnstile 获取)"
read -p "请输入 TURNSTILE_SECRET_KEY（或按 Enter 跳过）: " TURNSTILE_SECRET
if [ -n "$TURNSTILE_SECRET" ]; then
    echo "$TURNSTILE_SECRET" | npx wrangler secret put TURNSTILE_SECRET_KEY --name browserscan-network-injector
    echo -e "${GREEN}✓ TURNSTILE_SECRET_KEY 已设置${NC}"
fi

# PDF_SIGNING_KEY
echo ""
echo "3. PDF_SIGNING_KEY (自动生成)"
PDF_KEY=$(openssl rand -base64 32)
echo "$PDF_KEY" | npx wrangler secret put PDF_SIGNING_KEY --name browserscan-network-injector
echo -e "${GREEN}✓ PDF_SIGNING_KEY 已设置（自动生成）${NC}"

# 构建 Pages
echo -e "\n${YELLOW}[8/8] 构建 Pages...${NC}"
cd apps/web
npm run pages:build
echo -e "${GREEN}✓ Pages 构建成功${NC}"

# 部署 Pages
echo -e "\n${YELLOW}部署 Pages...${NC}"
if npx wrangler pages deploy .open-next/assets --project-name=browserscan-web 2>&1 | tee /tmp/pages-deploy.log; then
    echo -e "${GREEN}✓ Pages 部署成功${NC}"

    # 获取 Pages URL
    PAGES_URL=$(grep -o 'https://[^ ]*\.pages\.dev' /tmp/pages-deploy.log | head -1)
    if [ -n "$PAGES_URL" ]; then
        echo -e "${GREEN}Pages URL: ${PAGES_URL}${NC}"
    fi
else
    echo -e "${YELLOW}Pages 部署失败，可以稍后通过 GitHub Actions 自动部署${NC}"
fi

cd ../..

# 完成
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║              🎉 部署完成！                           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}部署信息：${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ -n "$WORKER_URL" ] && echo "Worker URL: $WORKER_URL"
[ -n "$PAGES_URL" ] && echo "Pages URL:  $PAGES_URL"
echo ""
echo "Dashboard: https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n${YELLOW}下一步：${NC}"
echo "1. 访问 Worker URL 测试 API"
echo "2. 访问 Pages URL 测试前端"
echo "3. 配置自定义域名（可选）"
echo "4. 设置 GitHub Actions 自动部署（推荐）"
echo ""
echo "查看完整文档: docs/DEPLOYMENT.md"
