# Deployment Guide

## Vercel Frontend Deployment

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import the GitHub repository: `https://github.com/Shmonin/navigapp`

### 2. Configure Environment Variables

In Vercel project settings, add these environment variables:

**Production Environment:**
```
VITE_SUPABASE_URL=https://zcvaxzakzkszoxienepi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdmF4emFremtzem94aWVuZXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4Njg1NzMsImV4cCI6MjA0ODQ0NDU3M30.6uG5_PcOOW5UxqpGTlLjqgKAZuM9jJ0GJsHAcMH2YPU
VITE_API_URL=https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api
VITE_TELEGRAM_BOT_USERNAME=navigapp_bot
```

### 3. Deploy

Vercel will automatically deploy when you push to main branch.

## Supabase Edge Functions Deployment

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Create new function called "navigapp-api"
4. Copy the content from `supabase/functions/navigapp-api/index.ts`
5. Deploy the function

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref zcvaxzakzkszoxienepi

# Deploy functions
supabase functions deploy navigapp-api
```

## API Testing

After deployment, test these endpoints:

1. **Health check:**
   ```bash
   curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/health
   ```

2. **Auth endpoint:**
   ```bash
   curl -X POST https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/auth/telegram \
     -H "Content-Type: application/json" \
     -d '{"initData": "test-data"}'
   ```

## Telegram Bot Setup

### 1. Create Bot

1. Message @BotFather on Telegram
2. Send `/newbot`
3. Choose name: "Navigapp"
4. Choose username: "navigapp_bot" (or similar)
5. Save the bot token

### 2. Configure Mini App

1. Send `/newapp` to @BotFather
2. Select your bot
3. Enter app title: "Navigapp"
4. Enter description: "Create structured navigation for Telegram"
5. Upload app icon (use the SVG from `frontend/public/favicon.svg`)
6. Enter web app URL: `https://your-vercel-domain.vercel.app`

### 3. Update Environment Variables

Update Vercel environment variables with:
```
VITE_TELEGRAM_BOT_USERNAME=Navigapp_bot
```

### 4. Bot Configuration

**Bot Token:** `8180571940:AAG8TLcs6ILfmPRFTN9cK14rVl11_n1PSOI`
**Username:** @Navigapp_bot
**Web App URL:** https://navigapp.vercel.app

## Next Steps

1. Deploy frontend to Vercel
2. Deploy Edge Functions to Supabase
3. Create Telegram bot
4. Test complete flow
5. Update documentation with actual URLs

## Troubleshooting

### API Returns 401 Unauthorized

The Edge Functions might still have JWT verification enabled. Check:
1. Ensure `verify_jwt = false` in `supabase/config.toml`
2. Redeploy the function
3. Check function logs in Supabase dashboard

### Frontend Build Fails

Ensure all dependencies are installed:
```bash
cd frontend && npm install
cd ../shared && npm install && npm run build
cd ../frontend && npm run build
```