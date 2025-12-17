#!/bin/bash

# BrowserScan.org - Wrangler Configuration Setup Script
# This script helps you create wrangler.toml from the template

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WORKER_DIR="$PROJECT_ROOT/workers/network-injector"
TEMPLATE="$WORKER_DIR/wrangler.toml.example"
TARGET="$WORKER_DIR/wrangler.toml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BrowserScan.org Wrangler Setup Wizard        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if wrangler.toml already exists
if [ -f "$TARGET" ]; then
    echo -e "${YELLOW}⚠️  wrangler.toml already exists!${NC}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
fi

# Copy template
echo -e "${BLUE}[1/5] Copying template...${NC}"
cp "$TEMPLATE" "$TARGET"
echo -e "${GREEN}✓ Template copied${NC}"
echo ""

# Get Cloudflare Account ID
echo -e "${BLUE}[2/5] Cloudflare Account ID${NC}"
echo "Find it at: https://dash.cloudflare.com/ (in sidebar)"
read -p "Enter your Cloudflare Account ID: " ACCOUNT_ID

if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}Error: Account ID cannot be empty${NC}"
    exit 1
fi

sed -i.bak "s/YOUR_CLOUDFLARE_ACCOUNT_ID/$ACCOUNT_ID/g" "$TARGET"
echo -e "${GREEN}✓ Account ID configured${NC}"
echo ""

# Get D1 Database ID
echo -e "${BLUE}[3/5] D1 Database ID${NC}"
echo "Run: wrangler d1 list"
echo "Or create new: wrangler d1 create browserscan-db"
read -p "Enter your D1 Database ID: " DATABASE_ID

if [ -z "$DATABASE_ID" ]; then
    echo -e "${YELLOW}⚠️  Skipping D1 configuration${NC}"
else
    sed -i.bak "s/YOUR_D1_DATABASE_ID/$DATABASE_ID/g" "$TARGET"
    echo -e "${GREEN}✓ D1 Database ID configured${NC}"
fi
echo ""

# Get KV Namespace IDs
echo -e "${BLUE}[4/5] KV Namespace IDs${NC}"
echo "Run: wrangler kv:namespace list"
echo ""
read -p "Enter RATE_LIMIT_KV ID (or press Enter to skip): " RATE_LIMIT_KV_ID
read -p "Enter IPINFO_CACHE_KV ID (or press Enter to skip): " IPINFO_CACHE_KV_ID

if [ -n "$RATE_LIMIT_KV_ID" ]; then
    sed -i.bak "s/YOUR_RATE_LIMIT_KV_ID/$RATE_LIMIT_KV_ID/g" "$TARGET"
    echo -e "${GREEN}✓ RATE_LIMIT_KV configured${NC}"
fi

if [ -n "$IPINFO_CACHE_KV_ID" ]; then
    sed -i.bak "s/YOUR_IPINFO_CACHE_KV_ID/$IPINFO_CACHE_KV_ID/g" "$TARGET"
    echo -e "${GREEN}✓ IPINFO_CACHE_KV configured${NC}"
fi
echo ""

# Cleanup backup files
rm -f "$TARGET.bak"

# Verify .gitignore
echo -e "${BLUE}[5/5] Security check...${NC}"
if git check-ignore "$TARGET" &>/dev/null; then
    echo -e "${GREEN}✓ wrangler.toml is in .gitignore${NC}"
else
    echo -e "${RED}⚠️  WARNING: wrangler.toml is NOT in .gitignore!${NC}"
    echo -e "${YELLOW}Please add it to .gitignore to prevent accidental commits${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Setup Complete!                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "1. Review: $TARGET"
echo "2. Replace any remaining placeholders manually"
echo "3. Deploy: cd workers/network-injector && wrangler deploy"
echo ""
echo -e "${YELLOW}⚠️  NEVER commit wrangler.toml to version control!${NC}"
