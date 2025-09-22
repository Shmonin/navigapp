# 🚀 Deployment Guide

**Статус:** ✅ **Полностью развернуто и работает**

Navigapp успешно развернут и готов к использованию:
- **Frontend:** https://navigapp.vercel.app
- **API:** https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api
- **Telegram Bot:** [@Navigapp_bot](https://t.me/Navigapp_bot)

## 🌐 Vercel Frontend Deployment

### ✅ Текущая конфигурация (уже развернуто)

**Repository:** Connected to GitHub repository
**Build Configuration:**
- **Build Command:** `cd frontend && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `cd frontend && npm install && cd ../shared && npm install && npm run build`
- **Node.js Version:** 18.x

### ✅ Environment Variables (настроены)

```env
VITE_SUPABASE_URL=https://zcvaxzakzkszoxienepi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdmF4emFremtzem94aWVuZXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4Njg1NzMsImV4cCI6MjA0ODQ0NDU3M30.6uG5_PcOOW5UxqpGTlLjqgKAZuM9jJ0GJsHAcMH2YPU
VITE_API_URL=https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api
VITE_TELEGRAM_BOT_USERNAME=navigapp_bot
```

### ✅ Vercel Configuration (активно)

**File:** `vercel.json`
- **CSP Headers:** Настроены для Telegram WebApp безопасности
- **CORS:** Разрешены домены Telegram (web.telegram.org, t.me)
- **Routing:** SPA routing для `/p/:slug` страниц
- **Frame Policy:** ALLOWALL для встраивания в Telegram

### 🔄 Automatic Deployment

**Trigger:** Push to `main` branch
**Status:** ✅ Auto-deploy работает
**Build Time:** ~2-3 минуты
**Domains:**
- Primary: https://navigapp.vercel.app
- Preview: автоматические preview URLs для PR

## ⚡ Supabase Edge Functions Deployment

### ✅ Текущий статус (развернуто и работает)

**Function Name:** `navigapp-api`
**URL:** https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api
**Status:** ✅ Активно и отвечает на запросы

### 🔧 Автоматизированный деплой

**Скрипт:** `deploy-functions.sh` (в корне проекта)

```bash
# Быстрый деплой Edge Functions
./deploy-functions.sh
```

**Скрипт выполняет:**
1. Подключение к Supabase проекту
2. Деплой всех функций из `supabase/functions/`
3. Проверка успешности деплоя
4. Тестирование endpoints

### 📝 Manual Deploy (если нужно)

**Через Supabase CLI:**
```bash
# Логин в Supabase
supabase login

# Подключение к проекту
supabase link --project-ref zcvaxzakzkszoxienepi

# Деплой функции
supabase functions deploy navigapp-api
```

### ✅ Тестирование API (проверено и работает)

**Base URL:** `https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api`

```bash
# 1. Health check
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/health

# 2. API info
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/

# 3. Telegram auth (mock)
curl -X POST https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "test-data"}'

# 4. Pages endpoint
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/pages
```

## 🤖 Telegram Bot Configuration

### ✅ Полностью настроен и работает

**Bot Details:**
- **Name:** Navigapp
- **Username:** [@Navigapp_bot](https://t.me/Navigapp_bot)
- **Token:** `8180571940:AAG8TLcs6ILfmPRFTN9cK14rVl11_n1PSOI`
- **Web App URL:** https://navigapp.vercel.app

### ✅ Mini App Configuration (активно)

**Настройки в @BotFather:**
- **App Title:** "Navigapp"
- **Description:** "Create structured navigation for Telegram"
- **Web App URL:** https://navigapp.vercel.app
- **Icon:** Загружен
- **Status:** ✅ Active

### 📱 Как протестировать

1. **Откройте [@Navigapp_bot](https://t.me/Navigapp_bot)**
2. **Нажмите "Открыть приложение"**
3. **Verify:** Приложение загружается с Telegram темой
4. **Check:** API вызовы работают в консоли браузера

## 🗄️ Database Configuration

### ✅ PostgreSQL Schema (развернуто)

**Supabase Project:** `zcvaxzakzkszoxienepi`
**Connection:** Настроено через Prisma ORM
**Tables:**
- ✅ `users` - Telegram пользователи
- ✅ `pages` - Навигационные страницы
- ✅ `page_blocks` - Блоки контента
- ✅ `block_cards` - Карточки навигации
- ✅ `analytics_events` - Аналитика
- ✅ `subscriptions` - Подписки
- ✅ `payments` - Платежи

### 🔧 Migration Management

```bash
# Apply migrations (if database schema changes)
cd backend
npx prisma migrate deploy

# Generate new Prisma client
npx prisma generate
```

## 🚀 Production Workflow

### ✅ Continuous Deployment (настроено)

**Frontend (Vercel):**
1. Push to `main` branch
2. ✅ Automatic build and deploy
3. ✅ Environment variables injected
4. ✅ CSP headers applied
5. ✅ Available at https://navigapp.vercel.app

**Backend (Supabase Edge Functions):**
1. Run `./deploy-functions.sh`
2. ✅ Function deployed to Supabase
3. ✅ CORS configured
4. ✅ Available at API endpoints

### 🔄 Development Workflow

**Local Development:**
```bash
# Frontend
cd frontend && npm run dev

# Testing with ngrok (для Telegram)
ngrok http 5173
# Update bot URL in @BotFather для testing
```

**Production Testing:**
1. ✅ Frontend: https://navigapp.vercel.app
2. ✅ API: Endpoints работают
3. ✅ Telegram Bot: [@Navigapp_bot](https://t.me/Navigapp_bot)

## 🛡️ Security & Configuration

### ✅ Headers & Security (настроено)

**Vercel Headers:**
- `X-Frame-Options: ALLOWALL` - для Telegram embedding
- `Content-Security-Policy` - ограничивает источники контента
- `Cross-Origin-Embedder-Policy: unsafe-none`

**CORS Configuration:**
- ✅ `Access-Control-Allow-Origin: *`
- ✅ Telegram domains разрешены
- ✅ Все HTTP методы настроены

### 🔐 Environment Security

**Sensitive Data:**
- ✅ Telegram Bot Token в environment variables
- ✅ Supabase keys настроены
- ✅ Database URL через environment
- ✅ No hardcoded secrets in code

## 📊 Monitoring & Logs

### ✅ Available Monitoring

**Vercel:**
- ✅ Build logs
- ✅ Runtime logs
- ✅ Analytics dashboard
- ✅ Error tracking

**Supabase:**
- ✅ Edge Function logs
- ✅ Database monitoring
- ✅ API usage metrics
- ✅ Error logs in dashboard

### 🔍 Debugging Commands

```bash
# Check function logs
supabase functions logs navigapp-api

# Test API endpoints
curl -v https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/health

# Check build status
vercel logs https://navigapp.vercel.app
```

## 🎯 Next Phase Deployment Tasks

### Phase 2 - Feature Development
- [ ] Настроить staging environment
- [ ] Добавить API rate limiting
- [ ] Настроить advanced monitoring
- [ ] Prepare T-Bank payment integration
- [ ] Setup automated testing in CI/CD

### Production Readiness
- [ ] Backup strategies для database
- [ ] Disaster recovery plan
- [ ] Performance monitoring
- [ ] User analytics integration
- [ ] A/B testing infrastructure

---

## ✅ Deployment Checklist

**Infrastructure (Phase 1) - ЗАВЕРШЕНО:**
- [x] Vercel frontend deployment
- [x] Supabase Edge Functions API
- [x] PostgreSQL database schema
- [x] Telegram bot configuration
- [x] Environment variables
- [x] Security headers
- [x] CORS configuration
- [x] Automated deployment scripts
- [x] API endpoint testing
- [x] Telegram WebApp integration

**Ready for Phase 2 Development!** 🚀