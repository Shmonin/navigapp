# Edge Functions Deployment Guide

## Manual Deployment via Dashboard

### 1. Deploy navigapp-api-v2

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zcvaxzakzkszoxienepi)
2. Navigate to **Edge Functions**
3. Click **New Function**
4. Function name: `navigapp-api-v2`
5. Click **Create Function**

### 2. Upload Function Code

#### Main function file (index.ts):
Copy entire content from: `/supabase/functions/navigapp-api-v2/index.ts`

#### Authentication module (telegram-auth.ts):
1. In the function editor, create new file: `telegram-auth.ts`
2. Copy entire content from: `/supabase/functions/navigapp-api-v2/telegram-auth.ts`

### 3. Function Settings

In the function settings, ensure:
- **Verify JWT**: Disabled (unchecked)
- **Import map**: Default
- **Deployment region**: Choose closest to your users

### 4. Deploy

Click **Deploy** button

### 5. Test Deployment

```bash
# Test health endpoint
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-...",
  "service": "navigapp-api-v2"
}
```

## Automated Deployment via CLI

### Prerequisites

1. Get your Supabase Access Token:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
   - Generate new token
   - Save it securely

2. Set environment variable:
```bash
export SUPABASE_ACCESS_TOKEN="your-token-here"
```

### Deploy Commands

```bash
# Install Supabase CLI
npm install -D supabase

# Link to project
npx supabase link --project-ref zcvaxzakzkszoxienepi

# Deploy function
npx supabase functions deploy navigapp-api-v2 --no-verify-jwt

# Deploy all functions
npx supabase functions deploy --no-verify-jwt
```

## Function Endpoints

### Base URL
```
https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2
```

### Available Endpoints

1. **Health Check**
   - GET `/health`
   - No authentication required

2. **Telegram Authentication**
   - POST `/auth/telegram`
   - Body: `{ "initData": "telegram_web_app_data" }`
   - Returns user info and tokens

3. **Pages Management**
   - GET `/pages` - List user pages
   - POST `/pages` - Create new page

## Troubleshooting

### Function returns 401 Unauthorized

1. Check that `verify_jwt` is disabled in function settings
2. Ensure CORS headers are properly set
3. Verify the function was deployed successfully

### Function not found (404)

1. Check the function name matches exactly: `navigapp-api-v2`
2. Ensure the function is deployed and active
3. Verify the URL path is correct

### Invalid Telegram authentication

1. Ensure bot token is correct in `telegram-auth.ts`
2. Check that initData from Telegram is properly formatted
3. Verify auth_date is within 24 hours

## Environment Variables

The function uses the following hardcoded values:
- **Bot Token**: Set in `telegram-auth.ts`
- **CORS Origins**: Set to `*` (all origins allowed)

To update these, edit the respective files and redeploy.

## Monitoring

View function logs in Supabase Dashboard:
1. Edge Functions → `navigapp-api-v2`
2. Click **Logs** tab
3. Filter by time range and log level

## Next Steps

After successful deployment:
1. Update Vercel environment variable: `VITE_API_URL`
2. Test authentication in Telegram Mini App
3. Monitor logs for any errors