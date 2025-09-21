# Navigapp

Telegram Mini App для создания структурированной навигации внутри каналов, групп и чатов через интерактивные карточки и меню.

## Структура проекта

```
├── backend/          # Node.js API (Fastify + Supabase)
├── frontend/         # React Mini App (Vite + TypeScript)
├── shared/           # Общие типы и утилиты
├── docs/             # Документация проекта
└── .github/          # GitHub Actions для CI/CD
```

## Технологический стек

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + CSS Modules
- Zustand (state management)
- @twa-dev/sdk (Telegram WebApp SDK)
- React Router 6
- React Hook Form + Zod

### Backend
- Node.js 20 + Fastify
- PostgreSQL (Supabase)
- Prisma ORM
- JWT Authentication
- T-Bank API (платежи)

### DevOps
- GitHub Actions (CI/CD)
- Vercel (frontend deploy)
- Supabase Edge Functions (backend)

## Разработка

### Требования
- Node.js 20+
- npm или yarn
- Git

### Первоначальная настройка

1. Клонируйте репозиторий
2. Установите зависимости:
   ```bash
   # Frontend
   cd frontend && npm install

   # Backend
   cd ../backend && npm install
   ```

3. Настройте переменные окружения (см. .env.example файлы)

4. Запустите проект:
   ```bash
   # Frontend (dev server)
   cd frontend && npm run dev

   # Backend (dev server)
   cd backend && npm run dev
   ```

## Документация

- [Техническое задание](docs/navigapp_prd.md)
- [Backend API](docs/backend.md)
- [Frontend Guide](docs/frontend.md)

## Лицензия

MIT License