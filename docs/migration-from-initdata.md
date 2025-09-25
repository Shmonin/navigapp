# Миграция от InitData к Bot Authentication

## Обзор

Этот документ описывает стратегию миграции от текущей системы аутентификации через Telegram InitData к новой системе bot authentication с долгоживущими токенами.

## Цели миграции

- ✅ Переход к долгоживущим токенам (90 дней)
- ✅ Минимизация взаимодействия с ботом
- ✅ Публичные ссылки на страницы без авторизации
- ✅ Улучшение пользовательского опыта
- ✅ Повышение безопасности системы

## Этапы миграции

### Phase 1: Инфраструктура (✅ Завершена)

**Сроки:** 1-2 недели
**Статус:** ✅ Готово к развертыванию

**Реализовано:**
- ✅ Обновление database schema
- ✅ Новые API endpoints (navigapp-api-v3)
- ✅ JWT Token Service с долгоживущими токенами
- ✅ Telegram Bot handlers
- ✅ Frontend AuthContext с поддержкой bot auth

**Файлы созданы:**
```
backend/prisma/schema.prisma          # Обновленная схема БД
supabase/functions/navigapp-api-v3/   # Новые API endpoints
supabase/functions/shared/jwt-service.ts  # JWT сервис
backend/bot/handlers.ts               # Bot обработчики
frontend/src/hooks/useBotAuth.ts      # Bot auth hook
frontend/src/components/auth/BotAuthComplete.tsx  # Компонент завершения auth
```

### Phase 2: Публичные страницы (✅ Завершена)

**Сроки:** 1 неделя
**Статус:** ✅ Готово к тестированию

**Реализовано:**
- ✅ PublicPageView компонент
- ✅ Роутинг `/p/:slug` для публичных страниц
- ✅ SEO мета-теги для публичных страниц
- ✅ API endpoint для публичного доступа

**Файлы созданы:**
```
frontend/src/components/pages/PublicPageView.tsx  # Публичные страницы
frontend/src/hooks/usePublicPage.ts              # Хук для публичных страниц
frontend/src/components/AppRouter.tsx             # Обновленный роутинг
```

### Phase 3: Постепенный переход (Планируется)

**Сроки:** 2-3 недели
**Статус:** 📋 Готово к запуску

**План действий:**

#### 3.1 Включение feature flags
```bash
# Backend (Supabase Edge Functions)
ENABLE_NEW_AUTH=true
ENABLE_BOT_AUTH=true
ENABLE_WEBAPP_FALLBACK=true
ENABLE_PUBLIC_PAGES=true
ENABLE_PARALLEL_AUTH=true
```

#### 3.2 Развертывание backend
```bash
# Применить миграции БД
cd backend
npx prisma migrate deploy

# Развернуть новый API
./deploy-functions.sh navigapp-api-v3

# Запустить Telegram Bot
cd backend/bot
deno run --allow-net --allow-env handlers.ts
```

#### 3.3 Развертывание frontend
```bash
# Обновить environment variables
REACT_APP_API_VERSION=v3
REACT_APP_ENABLE_BOT_AUTH=true
REACT_APP_ENABLE_PUBLIC_PAGES=true

# Развертывание
npm run build
vercel deploy --prod
```

#### 3.4 Тестирование системы
- [ ] Тестирование bot auth flow
- [ ] Проверка публичных страниц
- [ ] Валидация долгоживущих токенов
- [ ] Fallback на WebApp auth

### Phase 4: Полная миграция (Планируется)

**Сроки:** 1-2 недели
**Статус:** 📅 После тестирования Phase 3

**Автоматическая миграция пользователей:**

```typescript
// Псевдокод миграции
class UserMigration {
  async migrateExistingUsers() {
    const usersWithOldAuth = await this.getUsersWithWebAppAuth();

    for (const user of usersWithOldAuth) {
      // Создать долгоживущую сессию
      const tokens = await this.createLongLivedSession(user);

      // Обновить auth preference
      await this.updateUserAuthPreference(user.id, 'hybrid');

      // Уведомить о новых возможностях
      await this.notifyUserAboutNewFeatures(user);
    }
  }
}
```

### Phase 5: Очистка (Планируется)

**Сроки:** 1 неделя
**Статус:** 🗑️ После успешной миграции

**План очистки:**
- Удаление старых API endpoints
- Миграция документации
- Обновление bot команд
- Cleanup устаревшего кода

## Стратегия развертывания

### Canary Release

1. **5% пользователей** → новая система (1 неделя)
2. **25% пользователей** → новая система (1 неделя)
3. **50% пользователей** → новая система (1 неделя)
4. **100% пользователей** → новая система

### Feature Flags контроль

```typescript
// Контроль включения для разных групп пользователей
const shouldUseBotAuth = (userId: string) => {
  if (FeatureFlags.BOT_AUTH_ENABLED) {
    // Canary release logic
    const userHash = hashUserId(userId);
    const percentage = FeatureFlags.BOT_AUTH_ROLLOUT_PERCENTAGE;
    return userHash % 100 < percentage;
  }
  return false;
};
```

## Метрики успеха

### Технические метрики

- ✅ Bot auth success rate > 95%
- ✅ Public page load time < 2s
- ✅ Token refresh success rate > 99%
- ✅ Zero data loss during migration

### Бизнес метрики

- 📈 User engagement +25%
- 📈 Page sharing +40%
- 📈 User retention +15%
- 📉 Support requests -30%

### Мониторинг

```typescript
// Ключевые метрики для отслеживания
const MIGRATION_METRICS = {
  'auth.bot.success_rate': 'Bot auth success rate',
  'auth.bot.completion_time': 'Bot auth completion time',
  'pages.public.views': 'Public page views',
  'tokens.refresh.success_rate': 'Token refresh success rate',
  'users.migrated.count': 'Successfully migrated users',
  'errors.migration.count': 'Migration errors',
};
```

## План отката (Rollback)

### Автоматические триггеры отката

- Auth success rate < 90%
- Critical security issues
- Performance degradation > 50%
- Database corruption

### Процедура отката

```bash
# 1. Отключить новые features
export ENABLE_NEW_AUTH=false
export ENABLE_BOT_AUTH=false
export FALLBACK_TO_WEBAPP=true

# 2. Откат API
vercel rollback navigapp-api-v3

# 3. Откат БД (если необходимо)
npx prisma migrate rollback --to=before-auth-v3

# 4. Откат frontend
vercel rollback navigapp-frontend
```

## Коммуникация с пользователями

### Уведомления в боте

```
🚀 Новые возможности в Навигапп!

✨ Теперь доступно:
• Быстрый вход без повторной авторизации
• Прямые ссылки на ваши страницы
• Долгоживущие сессии (90 дней)

Используйте /login для перехода на новую систему!
```

### Email рассылка (если есть)

- Информация о новых возможностях
- Инструкции по переходу
- FAQ по новой системе

## Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| **Breaking Changes** | Средняя | Высокое | Параллельная система, Feature flags |
| **Telegram Bot Limits** | Низкая | Среднее | Fallback на WebApp auth |
| **SEO Problems** | Средняя | Среднее | Pre-rendering публичных страниц |
| **Security Issues** | Низкая | Высокое | Security audit, Короткие access tokens |
| **Migration Complexity** | Высокая | Высокое | Постепенная миграция, Rollback план |

## Тестирование

### Unit Tests

- ✅ JWT Token Service
- ✅ Bot Auth Flow
- ✅ Public Pages API
- ✅ Feature Flags

### Integration Tests

- 🧪 Bot → WebApp → Backend flow
- 🧪 Public pages SEO
- 🧪 Token refresh mechanism
- 🧪 Fallback scenarios

### E2E Tests

- 🎭 Complete user journey
- 🎭 Cross-device compatibility
- 🎭 Performance testing
- 🎭 Security testing

## FAQ

### Q: Что делать, если bot auth не работает?

A: Система автоматически откатится на WebApp auth. Пользователь получит уведомление о временных проблемах.

### Q: Как будут работать старые ссылки?

A: Все существующие ссылки будут работать. Добавлена поддержка публичных ссылок формата `/p/slug`.

### Q: Что с производительностью?

A: Ожидается улучшение производительности за счет:
- Долгоживущих токенов (меньше запросов auth)
- Кэширования публичных страниц
- CDN для статических ресурсов

### Q: Безопасность новой системы?

A: Новая система более безопасна:
- RSA подписи для JWT
- Device fingerprinting
- Короткие access tokens (15 минут)
- Audit trail всех операций

## Контакты

**Разработчик:** @kirillshmonin
**Техническая поддержка:** Через Telegram бот
**Документация:** `/docs` в репозитории
**Issue tracking:** GitHub Issues

---

*Этот план будет обновляться по мере прогресса миграции.*