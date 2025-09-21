#!/bin/bash

echo "🚀 Deploying Supabase Edge Functions..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${BLUE}Loading environment variables from .env.local...${NC}"
    export $(grep -v '^#' .env.local | xargs)
fi

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ SUPABASE_ACCESS_TOKEN is not set!${NC}"
    echo -e "${YELLOW}Please set it in .env.local or run:${NC}"
    echo -e "${BLUE}export SUPABASE_ACCESS_TOKEN='your-token-here'${NC}"
    exit 1
fi

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}npx is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Access token found${NC}"

echo -e "${YELLOW}Linking to project zcvaxzakzkszoxienepi...${NC}"
npx supabase@latest link --project-ref zcvaxzakzkszoxienepi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to link project. Please check your access token.${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying navigapp-api-v2 function...${NC}"
npx supabase@latest functions deploy navigapp-api-v2 --no-verify-jwt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Function deployed successfully!${NC}"
    echo -e "${GREEN}API URL: https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2${NC}"
else
    echo -e "${RED}❌ Deployment failed. Please check the errors above.${NC}"
    exit 1
fi

echo -e "${YELLOW}Testing the deployed function...${NC}"
response=$(curl -s "https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2/health")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Test auth endpoint: curl -X POST https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2/auth/telegram -d '{\"initData\":\"demo-init-data\"}' -H 'Content-Type: application/json'"
echo -e "2. Update Vercel environment variables if needed"
echo -e "3. Test Telegram Mini App authorization"