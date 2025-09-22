# Navigapp

**Статус проекта:** 🚀 **Phase 1 - Инфраструктура завершена**

Telegram Mini App для создания структурированной навигации внутри каналов, групп и чатов через интерактивные карточки и меню.

## 🎯 Текущий статус реализации

✅ **Завершено (Phase 1 - Инфраструктура):**
- Полная настройка инфраструктуры проекта
- React frontend развернут на Vercel с интеграцией Telegram WebApp
- Supabase Edge Functions API с аутентификацией
- PostgreSQL база данных с полной схемой (Prisma ORM)
- Telegram bot @Navigapp_bot настроен и работает
- Функционирующая аутентификация пользователей
- Автоматический pipeline деплоя для Edge Functions
- Настроены инструменты разработки и скрипты

🚧 **В разработке (Phase 2 - Основной функционал):**
- UI компоненты для создания страниц
- Система управления карточками и блоками
- Публичные страницы навигации
- Система подписок и ограничений

## 🌐 Развертывание

**Фронтенд (Vercel):** https://navigapp.vercel.app
**API (Supabase Edge Functions):** https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api
**Telegram Bot:** [@Navigapp_bot](https://t.me/Navigapp_bot)

## 📁 Структура проекта

```
├── frontend/         # React Mini App (Vite + TypeScript) - развернут на Vercel
├── supabase/         # Edge Functions API - развернут на Supabase
│   └── functions/
│       └── navigapp-api/    # Main API endpoint
├── backend/          # Prisma схема и migrations
├── shared/           # Общие типы и утилиты
├── docs/             # Документация проекта
├── .github/          # GitHub Actions для CI/CD
└── deploy-functions.sh   # Автоматизированный скрипт деплоя
```

## 🛠 Технологический стек

### Frontend (React Telegram WebApp)
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Telegram Integration:** @twa-dev/sdk
- **Routing:** React Router 6
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Deployment:** Vercel

### Backend (Supabase Edge Functions)
- **Runtime:** Deno (Supabase Edge Functions)
- **API Style:** RESTful endpoints
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma (для схемы и миграций)
- **Authentication:** Telegram WebApp validation
- **CORS:** Настроен для Telegram WebApp
- **Deployment:** Supabase

### Database Schema
- **Users:** Telegram ID, subscription info, preferences
- **Pages:** Navigation pages with hierarchy support
- **PageBlocks:** Different block types (list, grid, feed)
- **BlockCards:** Individual navigation cards
- **Analytics:** View/click tracking
- **Subscriptions & Payments:** T-Bank integration ready

### DevOps & Infrastructure
- **Deployment:** Automated via GitHub Actions + scripts
- **Frontend:** Vercel with CSP headers for Telegram
- **Backend:** Supabase Edge Functions
- **Database:** Supabase PostgreSQL
- **Environment:** Production configuration ready

## ⚡ Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/yourusername/navigapp
   cd navigapp
   ```

2. **Установите зависимости:**
   ```bash
   # Shared types
   cd shared && npm install && npm run build

   # Frontend
   cd ../frontend && npm install
   ```

3. **Настройте переменные окружения:**
   ```bash
   # Скопируйте .env.local в корне проекта или создайте frontend/.env.local
   cp .env.local frontend/.env.local
   ```

4. **Запустите фронтенд:**
   ```bash
   cd frontend && npm run dev
   ```

5. **Откройте в Telegram Web или используйте ngrok для тестирования в мобильном Telegram**

### Тестирование в Telegram

1. **Локальная разработка с ngrok:**
   ```bash
   # В новом терминале
   ngrok http 5173
   # Обновите URL в @BotFather для тестирования
   ```

2. **Production тестирование:**
   - Откройте [@Navigapp_bot](https://t.me/Navigapp_bot)
   - Нажмите "Открыть приложение"

## 📚 Документация

### Основная документация
- **[Техническое задание](docs/navigapp_prd.md)** - Полные требования к продукту
- **[Backend API Guide](docs/backend.md)** - API эндпоинты и архитектура
- **[Frontend Development](docs/frontend.md)** - React компоненты и Telegram интеграция
- **[Deployment Guide](DEPLOYMENT.md)** - Инструкции по развертыванию

### Техническая документация
- **[Telegram Mini App Setup](docs/telegram-miniapp-setup.md)** - Настройка Telegram бота
- **[Edge Functions Deployment](docs/edge-functions-deployment.md)** - Деплой на Supabase

## 🔧 API Endpoints (текущие)

**Base URL:** `https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api`

- `GET /` - API информация и доступные эндпоинты
- `GET /health` - Health check
- `POST /auth/telegram` - Telegram WebApp аутентификация
- `GET /pages` - Получить страницы пользователя (заглушка)
- `POST /pages` - Создать новую страницу (заглушка)

## 🚀 Roadmap

### Phase 2 - Основной функционал (в разработке)
- [ ] UI компоненты для создания страниц
- [ ] Page Builder wizard
- [ ] Система управления карточками
- [ ] Публичные страницы (/p/:slug)
- [ ] Базовая аналитика

### Phase 3 - Продвинутые функции
- [ ] Pro подписка и платежи (T-Bank)
- [ ] Расширенная аналитика
- [ ] Дополнительные типы блоков
- [ ] Экспорт/импорт
- [ ] Командная работа

### Phase 4 - Масштабирование
- [ ] API для внешних интеграций
- [ ] White-label решения
- [ ] Расширенная аналитика
- [ ] Мобильное приложение

## 🔐 Безопасность

- Telegram WebApp authentication validation
- CORS настроен для Telegram доменов
- CSP headers для защиты от XSS
- Environment variables для sensitive данных
- Rate limiting планируется в Phase 2

## 📄 Лицензия

MIT License

---

**Навигапп** - создавайте удобную навигацию для ваших Telegram каналов и групп!