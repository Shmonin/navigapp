# Backend Requirements: Навигапп API

**Статус:** 🚀 **Phase 1 Завершена - Инфраструктура развернута**

## 📊 Статус реализации

### ✅ Завершено (Phase 1 - Инфраструктура)
- **✅ Supabase Edge Functions API** - Развернуто и работает
- **✅ PostgreSQL Database Schema** - Полная схема через Prisma
- **✅ CORS Configuration** - Настроено для Telegram WebApp
- **✅ Basic API Endpoints** - Health check, auth, pages (mock)
- **✅ Error Handling** - Стандартизированные ответы
- **✅ Environment Configuration** - Production ready
- **✅ Automated Deployment** - Скрипт deploy-functions.sh

### 🚧 В разработке (Phase 2 - Основной функционал)
- **⏳ Database Integration** - Подключение Prisma к Edge Functions
- **⏳ Telegram Auth Validation** - Реальная валидация initData
- **⏳ Pages CRUD** - Полная реализация управления страницами
- **⏳ Blocks & Cards Management** - API для блоков и карточек
- **⏳ User Management** - Создание и обновление пользователей
- **⏳ Analytics Events** - Трекинг просмотров и кликов

### 📋 Запланировано (Phase 3)
- **📅 T-Bank Payment Integration** - Подписки и платежи
- **📅 File Upload** - Supabase Storage для изображений
- **📅 Rate Limiting** - Защита от злоупотреблений
- **📅 Advanced Analytics** - Детальная аналитика
- **📅 Webhook Handlers** - Payment confirmations

## 🌐 Текущие API Endpoints

**Base URL:** `https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api`

### ✅ Работающие endpoints
- `GET /` - API информация и список endpoints
- `GET /health` - Health check статус
- `POST /auth/telegram` - Telegram аутентификация (mock response)
- `GET /pages` - Список страниц (mock response)
- `POST /pages` - Создание страницы (mock response)

### 🚧 В разработке (Phase 2)
- `GET /pages/:id` - Получить страницу по ID
- `PUT /pages/:id` - Обновить страницу
- `DELETE /pages/:id` - Удалить страницу
- `POST /pages/:id/blocks` - Добавить блок
- `PUT /blocks/:id` - Обновить блок
- `POST /blocks/:id/cards` - Добавить карточку
- `PUT /cards/:id` - Обновить карточку
- `POST /analytics/events` - Записать аналитическое событие

## 1. Техническая архитектура

### 1.1 Технологический стек ✅ (ОБНОВЛЕНО - Реализовано)
- **Runtime:** Deno (Supabase Edge Functions) ✅
- **Framework:** Native Deno HTTP Server ✅
- **Database:** PostgreSQL (Supabase) ✅
- **ORM:** Prisma 5.x (для схемы и миграций) ✅
- **Authentication:** Custom Telegram WebApp validation ✅
- **CORS:** Configured для Telegram domains ✅
- **File Storage:** Supabase Storage (готово для Phase 2)
- **Payments:** T-Bank API (планируется в Phase 3)
- **Deployment:** Supabase Edge Functions ✅
- **Environment:** TypeScript (через Deno) ✅

### 1.2 Архитектурные принципы
- **RESTful API** с четкой структурой endpoints
- **Middleware-based** обработка запросов
- **Service layer** для бизнес-логики
- **Repository pattern** для работы с данными
- **Error-first** обработка ошибок
- **Validation-first** подход к входным данным

## 2. База данных

### 2.1 Схема базы данных

```sql
-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  subscription_type VARCHAR(50) DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  trial_used BOOLEAN DEFAULT false,
  total_pages_created INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Страницы
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  parent_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT max_title_length CHECK (length(title) <= 255),
  CONSTRAINT no_self_reference CHECK (id != parent_page_id)
);

-- Блоки на странице
CREATE TABLE page_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('vertical_list', 'grid', 'horizontal_scroll', 'feed')),
  title VARCHAR(255),
  description TEXT,
  position INTEGER NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_position CHECK (position >= 0),
  CONSTRAINT unique_position_per_page UNIQUE (page_id, position)
);

-- Карточки в блоке
CREATE TABLE block_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID NOT NULL REFERENCES page_blocks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  background_image_url VARCHAR(500),
  link_url VARCHAR(500),
  link_type VARCHAR(50) DEFAULT 'external' CHECK (link_type IN ('external', 'internal')),
  internal_page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_position CHECK (position >= 0),
  CONSTRAINT unique_position_per_block UNIQUE (block_id, position),
  CONSTRAINT valid_link CHECK (
    (link_type = 'external' AND link_url IS NOT NULL) OR
    (link_type = 'internal' AND internal_page_id IS NOT NULL)
  )
);

-- Аналитика событий
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'click', 'share')),
  card_id UUID REFERENCES block_cards(id) ON DELETE SET NULL,
  user_telegram_id BIGINT,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Подписки
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('trial', 'monthly', 'yearly')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  tbank_subscription_id VARCHAR(255),
  amount INTEGER NOT NULL, -- В копейках
  currency VARCHAR(3) DEFAULT 'RUB',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renewal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Платежи
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  tbank_payment_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_method VARCHAR(100),
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_subscription ON users(subscription_type, subscription_expires_at);
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published) WHERE is_published = true;
CREATE INDEX idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX idx_block_cards_block_id ON block_cards(block_id);
CREATE INDEX idx_analytics_page_id ON analytics_events(page_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Триггеры для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_blocks_updated_at BEFORE UPDATE ON page_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_block_cards_updated_at BEFORE UPDATE ON block_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Миграции
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String    @id @default(uuid())
  telegramId           BigInt    @unique @map("telegram_id")
  username             String?
  firstName            String?   @map("first_name")
  lastName             String?   @map("last_name")
  subscriptionType     String    @default("free") @map("subscription_type")
  subscriptionExpiresAt DateTime? @map("subscription_expires_at")
  trialUsed            Boolean   @default(false) @map("trial_used")
  totalPagesCreated    Int       @default(0) @map("total_pages_created")
  lastActiveAt         DateTime  @default(now()) @map("last_active_at")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  pages         Page[]
  subscriptions Subscription[]

  @@map("users")
}

// ... остальные модели
```

## 3. API Спецификация

### 3.1 Аутентификация

#### POST /auth/telegram
Аутентификация пользователя через Telegram WebApp

**Request:**
```typescript
interface TelegramAuthRequest {
  initData: string; // Telegram WebApp initData
}
```

**Response:**
```typescript
interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      telegramId: string;
      username?: string;
      firstName?: string;
      subscriptionType: 'free' | 'pro';
      subscriptionExpiresAt?: string;
    };
    token: string;
    refreshToken: string;
  };
}
```

**Validation:**
- Проверка подписи initData с bot token
- Проверка timestamp (не старше 24 часов)
- Создание или обновление пользователя

#### POST /auth/refresh
Обновление access token

**Request:**
```typescript
interface RefreshRequest {
  refreshToken: string;
}
```

### 3.2 Пользователи

#### GET /users/profile
Получение профиля текущего пользователя

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
interface UserProfile {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  subscriptionType: 'free' | 'pro';
  subscriptionExpiresAt?: string;
  trialUsed: boolean;
  totalPagesCreated: number;
  limits: {
    maxPages: number;
    maxCardsPerPage: number;
    availableBlockTypes: string[];
    canCreateInternalPages: boolean;
  };
}
```

#### PUT /users/profile
Обновление профиля

**Request:**
```typescript
interface UpdateProfileRequest {
  firstName?: string;
  username?: string;
}
```

### 3.3 Страницы

#### GET /pages
Получение всех страниц пользователя

**Headers:** `Authorization: Bearer <token>`
**Query params:**
- `page?: number` (default: 1)
- `limit?: number` (default: 10)
- `search?: string`

**Response:**
```typescript
interface PagesResponse {
  pages: {
    id: string;
    title: string;
    description?: string;
    slug: string;
    isPublished: boolean;
    viewCount: number;
    clickCount: number;
    createdAt: string;
    updatedAt: string;
    blocksCount: number;
    cardsCount: number;
  }[];
  total: number;
  hasMore: boolean;
}
```

#### POST /pages
Создание новой страницы

**Request:**
```typescript
interface CreatePageRequest {
  title: string;
  description?: string;
  parentPageId?: string; // Только для Pro
}
```

**Validation:**
- Проверка лимитов по подписке
- Валидация длины title (1-255 символов)
- Проверка прав на создание внутренних страниц

#### GET /pages/:id
Получение страницы по ID

**Response:**
```typescript
interface PageResponse {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isPublished: boolean;
  parentPageId?: string;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  blocks: {
    id: string;
    type: 'vertical_list' | 'grid' | 'horizontal_scroll' | 'feed';
    title?: string;
    description?: string;
    position: number;
    settings: object;
    cards: {
      id: string;
      title: string;
      description?: string;
      iconUrl?: string;
      backgroundImageUrl?: string;
      linkUrl?: string;
      linkType: 'external' | 'internal';
      internalPageId?: string;
      position: number;
      clickCount: number;
    }[];
  }[];
  owner: {
    id: string;
    firstName?: string;
    username?: string;
  };
}
```

#### PUT /pages/:id
Обновление страницы

**Request:**
```typescript
interface UpdatePageRequest {
  title?: string;
  description?: string;
  isPublished?: boolean;
  blocks?: {
    id?: string; // Если есть - обновление, если нет - создание
    type: 'vertical_list' | 'grid' | 'horizontal_scroll' | 'feed';
    title?: string;
    description?: string;
    position: number;
    settings?: object;
    cards: {
      id?: string;
      title: string;
      description?: string;
      iconUrl?: string;
      backgroundImageUrl?: string;
      linkUrl?: string;
      linkType: 'external' | 'internal';
      internalPageId?: string;
      position: number;
    }[];
  }[];
}
```

**Business Logic:**
- Проверка прав владельца
- Валидация лимитов по подписке
- Проверка типов блоков для Free версии
- Атомарное обновление всех связанных сущностей

#### DELETE /pages/:id
Удаление страницы

**Validation:**
- Проверка прав владельца
- Каскадное удаление блоков и карточек

### 3.4 Аналитика

#### GET /analytics/page/:id
Получение аналитики для страницы

**Headers:** `Authorization: Bearer <token>`
**Query params:**
- `period?: 'day' | 'week' | 'month' | 'year'` (default: 'week')
- `from?: string` (ISO date)
- `to?: string` (ISO date)

**Response:**
```typescript
interface PageAnalytics {
  pageId: string;
  period: {
    from: string;
    to: string;
  };
  metrics: {
    totalViews: number;
    totalClicks: number;
    uniqueVisitors: number;
    ctr: number; // Click-through rate
  };
  timeline: {
    date: string;
    views: number;
    clicks: number;
  }[];
  topCards: {
    cardId: string;
    title: string;
    clicks: number;
    ctr: number;
  }[];
  referrers: {
    source: string;
    views: number;
    percentage: number;
  }[];
}
```

#### POST /analytics/view
Регистрация просмотра страницы

**Request:**
```typescript
interface AnalyticsViewRequest {
  pageId: string;
  sessionId: string;
  referrer?: string;
}
```

#### POST /analytics/click
Регистрация клика по карточке

**Request:**
```typescript
interface AnalyticsClickRequest {
  pageId: string;
  cardId: string;
  sessionId: string;
}
```

### 3.5 Платежи и подписки

#### GET /payments/subscription-status
Получение статуса подписки

**Response:**
```typescript
interface SubscriptionStatus {
  type: 'free' | 'pro';
  status: 'active' | 'expired' | 'trial';
  expiresAt?: string;
  trialUsed: boolean;
  canStartTrial: boolean;
  nextPaymentDate?: string;
  autoRenewal: boolean;
}
```

#### POST /payments/start-trial
Активация пробного периода

**Request:**
```typescript
interface StartTrialRequest {
  returnUrl: string; // URL для возврата после оплаты
}
```

**Response:**
```typescript
interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  subscriptionId: string;
}
```

#### POST /payments/subscribe
Создание подписки

**Request:**
```typescript
interface SubscribeRequest {
  type: 'monthly' | 'yearly';
  returnUrl: string;
}
```

#### POST /webhooks/tbank
Webhook от T-Bank для обработки платежей

**Request:** T-Bank webhook payload
**Security:** Проверка подписи webhook

## 4. Бизнес-логика и валидация

### 4.1 Лимиты подписок

```typescript
const SUBSCRIPTION_LIMITS = {
  free: {
    maxPages: 1,
    maxCardsPerPage: 8,
    allowedBlockTypes: ['vertical_list'],
    canCreateInternalPages: false,
    hasAnalytics: false
  },
  pro: {
    maxPages: -1, // unlimited
    maxCardsPerPage: -1, // unlimited
    allowedBlockTypes: ['vertical_list', 'grid', 'horizontal_scroll', 'feed'],
    canCreateInternalPages: true,
    hasAnalytics: true
  }
};
```

### 4.2 Валидация входных данных

```typescript
// Схемы валидации с Joi
const createPageSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  parentPageId: Joi.string().uuid().optional()
});

const updateBlockSchema = Joi.object({
  type: Joi.string().valid('vertical_list', 'grid', 'horizontal_scroll', 'feed').required(),
  title: Joi.string().max(255).optional(),
  description: Joi.string().max(500).optional(),
  position: Joi.number().integer().min(0).required(),
  cards: Joi.array().items(cardSchema).max(50)
});
```

### 4.3 Middleware

```typescript
// Аутентификация
async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  
  const user = await validateToken(token);
  request.user = user;
}

// Проверка лимитов
async function checkLimitsMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user;
  const limits = SUBSCRIPTION_LIMITS[user.subscriptionType];
  
  // Логика проверки лимитов
}

// Rate limiting
const rateLimitOptions = {
  max: 100,
  timeWindow: '1 minute'
};
```

## 5. Интеграции

### 5.1 T-Bank API

```typescript
interface TBankConfig {
  apiUrl: string;
  terminalKey: string;
  secretKey: string;
}

class TBankService {
  async createPayment(params: {
    amount: number;
    orderId: string;
    description: string;
    customerKey: string;
    recurrent: boolean;
  }): Promise<TBankPaymentResponse> {
    // Реализация создания платежа
  }

  async checkPaymentStatus(paymentId: string): Promise<TBankStatusResponse> {
    // Проверка статуса платежа
  }

  validateWebhook(data: any, signature: string): boolean {
    // Валидация webhook подписи
  }
}
```

### 5.2 Supabase Integration

```typescript
// Конфигурация Supabase
const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_KEY
};

// Инициализация клиента
const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceKey);
```

## 6. Безопасность

### 6.1 Валидация Telegram WebApp

```typescript
function validateTelegramWebApp(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
    
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
}
```

### 6.2 CORS и безопасность

```typescript
const corsOptions = {
  origin: [
    'https://t.me',
    'https://web.telegram.org',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
```

## 7. Тестирование

### 7.1 Unit тесты

```typescript
// Пример теста для сервиса страниц
describe('PageService', () => {
  test('should create page with valid data', async () => {
    const pageData = {
      title: 'Test Page',
      description: 'Test Description'
    };
    
    const result = await pageService.createPage(userId, pageData);
    
    expect(result.success).toBe(true);
    expect(result.data.title).toBe(pageData.title);
  });
  
  test('should reject creation when limits exceeded', async () => {
    // Тест лимитов
  });
});
```

### 7.2 Integration тесты

```typescript
// Тестирование API endpoints
describe('Pages API', () => {
  test('POST /pages should create page', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/pages',
      headers: {
        authorization: `Bearer ${userToken}`
      },
      payload: {
        title: 'New Page'
      }
    });
    
    expect(response.statusCode).toBe(201);
  });
});
```

## 8. Производительность

### 8.1 Оптимизация запросов

- Использование индексов для частых запросов
- Connection pooling для базы данных
- Кэширование статических данных
- Пагинация для больших списков

### 8.2 Мониторинг

```typescript
// Метрики производительности
const performanceMetrics = {
  responseTime: histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds'
  }),
  
  dbQueryTime: histogram({
    name: 'db_query_duration_seconds',
    help: 'Duration of database queries in seconds'
  })
};
```

## 9. Деплой и конфигурация

### 9.1 Environment переменные

```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...

# T-Bank
TBANK_TERMINAL_KEY=...
TBANK_SECRET_KEY=...
TBANK_API_URL=https://securepay.tinkoff.ru/v2/

# App
JWT_SECRET=...
FRONTEND_URL=https://...
NODE_ENV=production
```

### 9.2 Supabase Edge Functions

```typescript
// supabase/functions/navigapp-api/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { method, url } = req;
  
  // Роутинг запросов
  return await handleRequest(req);
});
```

## 10. Документация API

### 10.1 OpenAPI спецификация

Генерация документации через Swagger/OpenAPI для всех endpoints с примерами запросов и ответов.

### 10.2 Коллекция Postman

Создание коллекции Postman с примерами всех API вызовов для тестирования.

---

*Этот документ содержит полные требования для разработки Backend части приложения Навигапп.*