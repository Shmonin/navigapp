#!/bin/bash

echo "🚀 Deploying Supabase Edge Functions..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}npx is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Logging in to Supabase...${NC}"
npx supabase login

echo -e "${YELLOW}Linking to project...${NC}"
npx supabase link --project-ref zcvaxzakzkszoxienepi

echo -e "${YELLOW}Deploying navigapp-api-v2 function...${NC}"
npx supabase functions deploy navigapp-api-v2 --no-verify-jwt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Function deployed successfully!${NC}"
    echo -e "${GREEN}API URL: https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2${NC}"
else
    echo -e "${RED}❌ Deployment failed. Please check the errors above.${NC}"
    exit 1
fi

echo -e "${YELLOW}Testing the deployed function...${NC}"
curl -s "https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2/health" | jq '.'

echo -e "${GREEN}🎉 Deployment complete!${NC}"