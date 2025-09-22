# API Reference - Navigapp

**Статус:** ✅ **Phase 1 - Базовые endpoints развернуты**

## 🌐 Base Information

**Base URL:** `https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api`
**Environment:** Production (Supabase Edge Functions)
**Authentication:** Telegram WebApp initData validation
**Response Format:** JSON

## 📊 Current Implementation Status

### ✅ Implemented Endpoints (Phase 1)
- `GET /` - API Information
- `GET /health` - Health Check
- `POST /auth/telegram` - Telegram Authentication (mock)
- `GET /pages` - Get User Pages (mock)
- `POST /pages` - Create Page (mock)

### 🚧 Coming in Phase 2
- Full CRUD operations for pages
- Database integration
- Real authentication validation
- Analytics endpoints
- User management

---

## 📋 API Endpoints

### 1. API Information

**Endpoint:** `GET /`

**Description:** Получить информацию о API и доступных endpoints

**Request:**
```bash
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/
```

**Response:**
```json
{
  "status": "ok",
  "message": "Navigapp API is running",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/auth/telegram",
    "pages": "/pages"
  }
}
```

---

### 2. Health Check

**Endpoint:** `GET /health`

**Description:** Проверка состояния API

**Request:**
```bash
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-09-22T10:30:00.000Z",
  "service": "navigapp-api"
}
```

---

### 3. Telegram Authentication

**Endpoint:** `POST /auth/telegram`

**Description:** Аутентификация пользователя через Telegram WebApp initData

**Status:** 🚧 Mock implementation (Phase 1)

**Request:**
```bash
curl -X POST https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "initData": "query_id=ABC&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%7D&auth_date=1695000000&hash=abc123"
  }'
```

**Request Body:**
```typescript
interface TelegramAuthRequest {
  initData: string; // Telegram WebApp initData string
}
```

**Response (Phase 1 - Mock):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "temp-user-id",
      "telegramId": "123456789",
      "firstName": "Test User",
      "subscriptionType": "free"
    },
    "token": "mock-jwt-token",
    "refreshToken": "mock-refresh-token"
  }
}
```

**Future Response (Phase 2):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "telegramId": "123456789",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "subscriptionType": "free",
      "subscriptionExpiresAt": null,
      "totalPagesCreated": 0,
      "lastActiveAt": "2024-09-22T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid initData",
    "code": "INVALID_TELEGRAM_DATA"
  }
}
```

---

### 4. Get User Pages

**Endpoint:** `GET /pages`

**Description:** Получить список страниц пользователя

**Status:** 🚧 Mock implementation (Phase 1)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of pages to return (default: 20)
- `offset` (optional): Number of pages to skip (default: 0)
- `status` (optional): Filter by status (`published`, `draft`)

**Request:**
```bash
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/pages \
  -H "Authorization: Bearer your-token-here"
```

**Response (Phase 1 - Mock):**
```json
{
  "success": true,
  "data": {
    "pages": [],
    "total": 0,
    "hasMore": false
  }
}
```

**Future Response (Phase 2):**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "My Navigation Page",
        "description": "A sample navigation page",
        "slug": "my-navigation-page",
        "isPublished": true,
        "viewCount": 42,
        "clickCount": 15,
        "createdAt": "2024-09-20T10:00:00.000Z",
        "updatedAt": "2024-09-21T15:30:00.000Z"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

---

### 5. Create Page

**Endpoint:** `POST /pages`

**Description:** Создать новую страницу навигации

**Status:** 🚧 Mock implementation (Phase 1)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreatePageRequest {
  title: string;           // Page title (required)
  description?: string;    // Page description (optional)
  slug?: string;          // Custom slug (optional, auto-generated if not provided)
}
```

**Request:**
```bash
curl -X POST https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/pages \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Page",
    "description": "Description of my page"
  }'
```

**Response (Phase 1 - Mock):**
```json
{
  "success": true,
  "data": {
    "id": "temp-page-id",
    "title": "My New Page",
    "slug": "temp-slug",
    "isPublished": false,
    "blocks": []
  }
}
```

**Future Response (Phase 2):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My New Page",
    "description": "Description of my page",
    "slug": "my-new-page",
    "isPublished": false,
    "parentPageId": null,
    "viewCount": 0,
    "clickCount": 0,
    "createdAt": "2024-09-22T10:30:00.000Z",
    "updatedAt": "2024-09-22T10:30:00.000Z",
    "blocks": []
  }
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": {
    "message": "Title is required",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "title",
      "reason": "Title cannot be empty"
    }
  }
}
```

---

## 🚧 Coming in Phase 2

### Pages Management
- `GET /pages/:id` - Get specific page
- `PUT /pages/:id` - Update page
- `DELETE /pages/:id` - Delete page
- `POST /pages/:id/publish` - Publish/unpublish page

### Blocks Management
- `POST /pages/:id/blocks` - Add block to page
- `PUT /blocks/:id` - Update block
- `DELETE /blocks/:id` - Delete block
- `POST /blocks/:id/reorder` - Reorder blocks

### Cards Management
- `POST /blocks/:id/cards` - Add card to block
- `PUT /cards/:id` - Update card
- `DELETE /cards/:id` - Delete card
- `POST /cards/:id/reorder` - Reorder cards

### Analytics
- `POST /analytics/events` - Record analytics event
- `GET /pages/:id/analytics` - Get page analytics
- `GET /analytics/dashboard` - User analytics dashboard

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/subscription` - Get subscription info

---

## 🔧 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}  // Optional additional details
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `INVALID_TELEGRAM_DATA` - Telegram initData validation failed

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🔐 Authentication

### Current Implementation (Phase 1)
- Mock response for development
- Basic structure for Telegram WebApp validation

### Phase 2 Implementation
- Real Telegram initData validation
- JWT token generation and validation
- Refresh token mechanism
- User session management

### Authentication Flow
1. User opens Telegram Mini App
2. Telegram provides `initData` string
3. Client sends `initData` to `/auth/telegram`
4. Server validates `initData` with Telegram
5. Server returns JWT token
6. Client uses token for authenticated requests

---

## 🧪 Testing

### Health Check Test
```bash
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/health
```

### Mock Authentication Test
```bash
curl -X POST https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "test-data"}'
```

### CORS Test
```bash
curl -H "Origin: https://navigapp.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/auth/telegram
```

---

## 📈 Rate Limiting (Planned for Phase 2)

### Limits
- **Authentication**: 10 requests per minute per IP
- **Pages API**: 100 requests per hour per user
- **Analytics**: 1000 events per hour per user
- **File Upload**: 50 uploads per hour per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1695123456
```

---

## 🔄 Versioning

**Current Version:** v1.0.0
**API Versioning Strategy:** URL versioning (planned for v2)
**Future URL Format:** `/v2/pages`

---

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs` folder
- **Telegram**: [@Navigapp_bot](https://t.me/Navigapp_bot)
- **Status Page**: Use `/health` endpoint

---

**Last Updated:** Phase 1 completion - September 2024
**Next Update:** Phase 2 database integration