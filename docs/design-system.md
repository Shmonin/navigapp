# Дизайн-система Navigapp

**Версия:** 1.0
**Дата:** 22.09.2025
**Статус:** В разработке

## Оглавление

1. [Принципы дизайна](#1-принципы-дизайна)
2. [Цветовая палитра](#2-цветовая-палитра)
3. [Типографика](#3-типографика)
4. [Spacing система](#4-spacing-система)
5. [Компоненты UI](#5-компоненты-ui)
6. [Иконки и иллюстрации](#6-иконки-и-иллюстрации)
7. [Анимации и переходы](#7-анимации-и-переходы)
8. [Layout patterns](#8-layout-patterns)
9. [Специфика Telegram Mini Apps](#9-специфика-telegram-mini-apps)
10. [Примеры кода](#10-примеры-кода)
11. [Responsive Design](#11-responsive-design)
12. [Темы и кастомизация](#12-темы-и-кастомизация)

---

## 1. Принципы дизайна

### 1.1 Основные принципы

#### Mobile-First для Telegram
- **Приоритет мобильного опыта:** Все интерфейсы проектируются сначала для мобильных устройств
- **Thumb-friendly дизайн:** Все интерактивные элементы доступны для управления большим пальцем
- **Минимальные размеры touch-целей:** 44px минимум для всех кнопок и ссылок

#### Consistency с Telegram
- **Нативное ощущение:** Интерфейс должен ощущаться как часть Telegram
- **Адаптивные темы:** Автоматическое переключение между светлой и темной темой
- **Системные цвета:** Использование цветовых переменных Telegram WebApp API

#### Минималистичность и функциональность
- **Контентно-ориентированный:** Фокус на контенте, минимум декоративных элементов
- **Четкая иерархия:** Ясная визуальная иерархия для быстрого сканирования
- **Прогрессивное раскрытие:** Показ информации по мере необходимости

#### Доступность и инклюзивность
- **WCAG 2.1 AA:** Соответствие стандартам доступности
- **Контрастность:** Минимум 4.5:1 для основного текста
- **Keyboard navigation:** Полная поддержка навигации с клавиатуры

### 1.2 Дизайн-принципы для Free/Pro версий

#### Free версия
- **Простота превыше всего:** Минимальный интерфейс без отвлекающих элементов
- **Ограничения как feature:** Четкие и понятные лимиты как мотивация к апгрейду
- **Качественный базовый опыт:** Полнофункциональная, но ограниченная версия

#### Pro версия
- **Расширенные возможности:** Дополнительные опции без усложнения интерфейса
- **Премиум-ощущение:** Дополнительные анимации и микровзаимодействия
- **Аналитика и инсайты:** Расширенная информация и статистика

---

## 2. Цветовая палитра

### 2.1 Telegram Theme Variables

Основа цветовой системы — переменные Telegram WebApp API:

```css
:root {
  /* Telegram WebApp основные цвета */
  --tg-theme-bg-color: #ffffff;           /* Основной фон */
  --tg-theme-text-color: #000000;         /* Основной текст */
  --tg-theme-hint-color: #999999;         /* Вторичный текст */
  --tg-theme-link-color: #2481cc;         /* Ссылки */
  --tg-theme-button-color: #2481cc;       /* Акцентные кнопки */
  --tg-theme-button-text-color: #ffffff;  /* Текст на кнопках */

  /* Telegram WebApp дополнительные (если доступны) */
  --tg-theme-secondary-bg-color: #f1f1f1; /* Вторичный фон */
  --tg-theme-header-bg-color: #ffffff;    /* Фон хедера */
  --tg-theme-accent-text-color: #2481cc;  /* Акцентный текст */
  --tg-theme-section-bg-color: #ffffff;   /* Фон секций */
  --tg-theme-section-header-text-color: #6d6d71; /* Заголовки секций */
  --tg-theme-subtitle-text-color: #999999; /* Подзаголовки */
  --tg-theme-destructive-text-color: #ff3b30; /* Деструктивные действия */
}
```

### 2.2 Семантические цвета

```css
:root {
  /* Primary - основной бренд */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: var(--tg-theme-button-color);
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Semantic colors */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: var(--tg-theme-destructive-text-color, #ef4444);
  --color-error-light: #fee2e2;
  --color-info: var(--tg-theme-link-color);
  --color-info-light: #dbeafe;

  /* Neutral colors - адаптивные под тему */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
}

/* Dark theme overrides */
[data-theme="dark"] {
  --color-neutral-50: #171717;
  --color-neutral-100: #262626;
  --color-neutral-200: #404040;
  --color-neutral-300: #525252;
  --color-neutral-400: #737373;
  --color-neutral-500: #a3a3a3;
  --color-neutral-600: #d4d4d4;
  --color-neutral-700: #e5e5e5;
  --color-neutral-800: #f5f5f5;
  --color-neutral-900: #fafafa;
}
```

### 2.3 Использование цветов

#### Фоновые цвета
```css
.bg-primary { background-color: var(--tg-theme-bg-color); }
.bg-secondary { background-color: var(--tg-theme-secondary-bg-color); }
.bg-section { background-color: var(--tg-theme-section-bg-color); }
```

#### Текстовые цвета
```css
.text-primary { color: var(--tg-theme-text-color); }
.text-secondary { color: var(--tg-theme-hint-color); }
.text-accent { color: var(--tg-theme-link-color); }
.text-destructive { color: var(--tg-theme-destructive-text-color); }
```

#### Цвета состояний
```css
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }
.text-info { color: var(--color-info); }
```

---

## 3. Типографика

### 3.1 Шрифтовая система

```css
:root {
  /* Основные шрифты */
  --font-family-sans: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

  /* Размеры шрифтов (адаптивные) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 3.2 Типографическая шкала

#### Заголовки
```css
.heading-1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--tg-theme-text-color);
  margin-bottom: 1.5rem;
}

.heading-2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--tg-theme-text-color);
  margin-bottom: 1rem;
}

.heading-3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--tg-theme-text-color);
  margin-bottom: 0.75rem;
}

.heading-4 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
  color: var(--tg-theme-text-color);
  margin-bottom: 0.5rem;
}
```

#### Основной текст
```css
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--tg-theme-text-color);
}

.body-base {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--tg-theme-text-color);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--tg-theme-hint-color);
}
```

#### Вспомогательный текст
```css
.caption {
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--tg-theme-hint-color);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.overline {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--tg-theme-section-header-text-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 3.3 Tracking (Letter-spacing)

#### Базовые значения tracking
```css
:root {
  /* Letter-spacing tokens */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

#### Семантические токены
```css
:root {
  /* Semantic tracking */
  --tracking-headlines: var(--tracking-tight);
  --tracking-body: var(--tracking-normal);
  --tracking-caption: var(--tracking-wide);
  --tracking-labels: var(--tracking-wider);
}
```

#### Правила применения
```css
/* Заголовки - уплотненный tracking для лучшей читаемости */
.heading-1, .heading-2, .heading-3 {
  letter-spacing: var(--tracking-headlines);
}

/* Основной текст - нормальный tracking */
.body-large, .body-base, .body-small {
  letter-spacing: var(--tracking-body);
}

/* Вспомогательный текст - расширенный tracking */
.caption, .overline {
  letter-spacing: var(--tracking-caption);
}

/* Лейблы и кнопки - максимальный tracking для разборчивости */
.button-text, .label, .badge {
  letter-spacing: var(--tracking-labels);
}

/* Адаптивный tracking для мобильных устройств */
@media (max-width: 640px) {
  .heading-1 {
    letter-spacing: var(--tracking-tighter);
  }

  .heading-2, .heading-3 {
    letter-spacing: var(--tracking-tight);
  }

  .caption, .overline {
    letter-spacing: var(--tracking-wider);
  }
}
```

### 3.4 Адаптивная типографика

```css
/* Мобильные устройства */
@media (max-width: 640px) {
  :root {
    --text-3xl: 1.5rem;   /* 24px */
    --text-2xl: 1.25rem;  /* 20px */
    --text-xl: 1.125rem;  /* 18px */
  }

  .heading-1 {
    margin-bottom: 1rem;
    letter-spacing: -0.025em;
  }

  .heading-2 {
    margin-bottom: 0.75rem;
    letter-spacing: -0.015em;
  }
}

/* Планшеты и больше */
@media (min-width: 768px) {
  :root {
    --text-4xl: 2.5rem;   /* 40px */
    --text-3xl: 2rem;     /* 32px */
  }
}
```

---

## 4. Spacing система

### 4.1 Базовая сетка (8px система)

```css
:root {
  /* Spacing scale (8px grid) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-7: 1.75rem;   /* 28px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Semantic spacing */
  --space-xs: var(--space-1);
  --space-sm: var(--space-2);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-12);
  --space-3xl: var(--space-16);
}
```

### 4.2 Паттерны отступов

#### Контейнеры и padding
```css
.container {
  padding-left: var(--space-4);
  padding-right: var(--space-4);
  max-width: 100%;
}

.section {
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}

.card {
  padding: var(--space-4);
}

.card-compact {
  padding: var(--space-3);
}

.card-comfortable {
  padding: var(--space-6);
}
```

#### Вертикальные отступы
```css
.stack-xs > * + * { margin-top: var(--space-2); }
.stack-sm > * + * { margin-top: var(--space-3); }
.stack-md > * + * { margin-top: var(--space-4); }
.stack-lg > * + * { margin-top: var(--space-6); }
.stack-xl > * + * { margin-top: var(--space-8); }
```

### 4.3 Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Адаптивные отступы */
@media (min-width: 640px) {
  .container {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}
```

---

## 5. Компоненты UI

### 5.1 Кнопки

#### Варианты кнопок
```css
/* Base button styles */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-4);
  border-radius: 12px;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-tight);
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  position: relative;
  overflow: hidden;
}

/* Primary button */
.button-primary {
  background-color: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
}

.button-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(0);
  opacity: 0.8;
}

/* Secondary button */
.button-secondary {
  background-color: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-text-color);
  border: 1px solid var(--color-neutral-200);
}

.button-secondary:hover {
  background-color: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

/* Ghost button */
.button-ghost {
  background-color: transparent;
  color: var(--tg-theme-link-color);
}

.button-ghost:hover {
  background-color: var(--color-neutral-100);
}

/* Danger button */
.button-danger {
  background-color: var(--color-error);
  color: white;
}

.button-danger:hover {
  opacity: 0.9;
}
```

#### Размеры кнопок
```css
.button-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  min-height: 36px;
  border-radius: 8px;
}

.button-md {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  min-height: 44px;
  border-radius: 12px;
}

.button-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-lg);
  min-height: 52px;
  border-radius: 16px;
}

.button-full {
  width: 100%;
}
```

#### Состояния кнопок
```css
.button:disabled,
.button-loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.button-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 5.2 Формы

#### Поля ввода
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: 12px;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--tg-theme-text-color);
  background-color: var(--tg-theme-bg-color);
  transition: all 0.2s ease;
  min-height: 44px;
}

.input:focus {
  outline: none;
  border-color: var(--tg-theme-button-color);
  box-shadow: 0 0 0 3px rgba(var(--tg-theme-button-color), 0.1);
}

.input::placeholder {
  color: var(--tg-theme-hint-color);
}

/* Input with error */
.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(var(--color-error), 0.1);
}
```

#### Текстовые области
```css
.textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: 12px;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--tg-theme-text-color);
  background-color: var(--tg-theme-bg-color);
  resize: vertical;
  min-height: 88px;
  transition: all 0.2s ease;
}

.textarea:focus {
  outline: none;
  border-color: var(--tg-theme-button-color);
  box-shadow: 0 0 0 3px rgba(var(--tg-theme-button-color), 0.1);
}
```

#### Чекбоксы и радиокнопки
```css
.checkbox,
.radio {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-input,
.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 6px;
  background-color: var(--tg-theme-bg-color);
  margin-right: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-indicator {
  background-color: var(--tg-theme-button-color);
  border-color: var(--tg-theme-button-color);
}

.checkbox-input:checked + .checkbox-indicator::after {
  content: '✓';
  color: var(--tg-theme-button-text-color);
  font-size: 12px;
  font-weight: bold;
}

.radio-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 50%;
  background-color: var(--tg-theme-bg-color);
  margin-right: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.radio-input:checked + .radio-indicator {
  border-color: var(--tg-theme-button-color);
}

.radio-input:checked + .radio-indicator::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--tg-theme-button-color);
}
```

### 5.3 Карточки навигации

#### Вертикальный список (Free + Pro)
```css
.card-vertical {
  display: flex;
  align-items: flex-start;
  padding: var(--space-4);
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 16px;
  border: 1px solid var(--color-neutral-200);
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.card-vertical:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-neutral-300);
}

.card-vertical:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-vertical-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: var(--color-neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-3);
  flex-shrink: 0;
  font-size: 20px;
}

.card-vertical-content {
  flex: 1;
  min-width: 0;
}

.card-vertical-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
}

.card-vertical-description {
  font-size: var(--text-sm);
  color: var(--tg-theme-hint-color);
  line-height: var(--leading-normal);
}
```

#### Сетка 2 колонки (Pro)
```css
.card-grid {
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-neutral-100);
  background-size: cover;
  background-position: center;
}

.card-grid:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-grid:active {
  transform: scale(0.98);
}

.card-grid-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  align-items: flex-end;
  padding: var(--space-4);
}

.card-grid-content {
  color: white;
}

.card-grid-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-1);
}

.card-grid-description {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  opacity: 0.9;
}
```

#### Горизонтальный скролл (Pro)
```css
.card-horizontal-container {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  padding: var(--space-2) 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.card-horizontal-container::-webkit-scrollbar {
  display: none;
}

.card-horizontal {
  flex: 0 0 auto;
  width: 200px;
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 16px;
  padding: var(--space-4);
  border: 1px solid var(--color-neutral-200);
  scroll-snap-align: start;
  transition: all 0.2s ease;
  cursor: pointer;
}

.card-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-horizontal-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: var(--color-neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
  font-size: 16px;
}

.card-horizontal-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.card-horizontal-description {
  font-size: var(--text-xs);
  color: var(--tg-theme-hint-color);
  line-height: var(--leading-normal);
}
```

#### Лента больших карточек (Pro)
```css
.card-feed {
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: var(--space-6);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--color-neutral-200);
}

.card-feed:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--color-neutral-300);
}

.card-feed-image {
  width: 100%;
  height: 200px;
  background-color: var(--color-neutral-100);
  background-size: cover;
  background-position: center;
  position: relative;
}

.card-feed-content {
  padding: var(--space-5);
}

.card-feed-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.card-feed-description {
  font-size: var(--text-base);
  color: var(--tg-theme-hint-color);
  line-height: var(--leading-normal);
}
```

### 5.4 Модальные окна и всплывающие панели

#### Модальное окно
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal {
  background-color: var(--tg-theme-bg-color);
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  margin: 0;
}

.modal-body {
  padding: var(--space-4) var(--space-6);
}

.modal-footer {
  padding: var(--space-4) var(--space-6) var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  border-top: 1px solid var(--color-neutral-200);
}
```

#### Bottom Sheet
```css
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--tg-theme-bg-color);
  border-radius: 20px 20px 0 0;
  padding: var(--space-6);
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1001;
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background-color: var(--color-neutral-300);
  border-radius: 2px;
  margin: 0 auto var(--space-4);
}
```

### 5.5 Navigation элементы

#### Вкладки
```css
.tabs {
  display: flex;
  background-color: var(--tg-theme-secondary-bg-color);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: var(--space-6);
}

.tab {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  text-align: center;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--tg-theme-hint-color);
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-active {
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```


### 5.6 Уведомления и алерты

#### Toast уведомления
```css
.toast {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  left: var(--space-4);
  background-color: var(--tg-theme-bg-color);
  border-radius: 12px;
  padding: var(--space-4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-neutral-200);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-warning {
  border-left: 4px solid var(--color-warning);
}

.toast-error {
  border-left: 4px solid var(--color-error);
}

.toast-info {
  border-left: 4px solid var(--color-info);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  margin-bottom: var(--space-1);
}

.toast-message {
  font-size: var(--text-sm);
  color: var(--tg-theme-hint-color);
}
```

#### Alert компоненты
```css
.alert {
  padding: var(--space-4);
  border-radius: 12px;
  margin-bottom: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.alert-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.alert-error {
  background-color: var(--color-error-light);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.alert-info {
  background-color: var(--color-info-light);
  color: var(--color-info);
  border: 1px solid var(--color-info);
}
```

### 5.7 Loading states и скелеты

#### Спиннеры
```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-neutral-200);
  border-top: 2px solid var(--tg-theme-button-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 1.5px;
}

.spinner-lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Скелетные экраны
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 25%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-card {
  height: 100px;
  border-radius: 16px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 5.8 Empty states и ошибки

#### Пустые состояния
```css
.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  margin-bottom: var(--space-2);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--tg-theme-hint-color);
  margin-bottom: var(--space-6);
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state-action {
  margin-top: var(--space-4);
}
```

#### Экраны ошибок
```css
.error-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
}

.error-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  color: var(--color-error);
}

.error-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  margin-bottom: var(--space-2);
}

.error-state-description {
  font-size: var(--text-base);
  color: var(--tg-theme-hint-color);
  margin-bottom: var(--space-6);
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.error-state-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}
```

---

## 6. Иконки и иллюстрации

### 6.1 Иконочная система Iconsax

Navigapp использует [Iconsax](https://iconsax.io/) - современную иконочную библиотеку с тремя стилями для различных контекстов использования.

#### Стили иконок
- **Linear (основной)** - для большинства UI элементов, навигации и контента
- **Bold (акценты)** - для активных состояний, важных действий и выделения
- **Animated (интерактивные)** - для микроанимаций, загрузки и интерактивных состояний

#### Размеры иконок
```css
:root {
  --icon-xs: 16px;   /* Мелкие элементы, индикаторы */
  --icon-sm: 20px;   /* Кнопки, инпуты */
  --icon-md: 24px;   /* Основной размер для UI */
  --icon-lg: 32px;   /* Заголовки секций */
  --icon-xl: 48px;   /* Центральные элементы */
  --icon-2xl: 64px;  /* Иллюстративные иконки */
}

.icon-xs { width: var(--icon-xs); height: var(--icon-xs); }
.icon-sm { width: var(--icon-sm); height: var(--icon-sm); }
.icon-md { width: var(--icon-md); height: var(--icon-md); }
.icon-lg { width: var(--icon-lg); height: var(--icon-lg); }
.icon-xl { width: var(--icon-xl); height: var(--icon-xl); }
.icon-2xl { width: var(--icon-2xl); height: var(--icon-2xl); }
```

#### Цветовые правила
```css
.icon-primary { color: var(--color-primary); }
.icon-secondary { color: var(--tg-theme-hint-color); }
.icon-success { color: var(--color-success); }
.icon-warning { color: var(--color-warning); }
.icon-error { color: var(--color-error); }
.icon-neutral { color: var(--tg-theme-text-color); }
```

### 6.2 Установка и интеграция

#### Установка
```bash
npm install iconsax-react
# или
yarn add iconsax-react
```

#### Базовое использование
```typescript
import { ArrowLeft, Add, Setting2, SearchNormal1 } from 'iconsax-react';

// Linear стиль (по умолчанию)
<ArrowLeft size="24" color="#292D32" />

// Bold стиль
<Add size="24" color="#292D32" variant="Bold" />

// Animated с состоянием
<SearchNormal1
  size="24"
  color="#292D32"
  variant="Linear"
  className="animate-pulse"
/>
```

#### React Hook для иконок
```typescript
// hooks/useIcon.ts
import { FC } from 'react';
import * as Icons from 'iconsax-react';

type IconVariant = 'Linear' | 'Bold' | 'Bulk' | 'Broken' | 'TwoTone';
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UseIconProps {
  name: keyof typeof Icons;
  variant?: IconVariant;
  size?: IconSize | number;
  color?: string;
  className?: string;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64
};

export const useIcon = ({
  name,
  variant = 'Linear',
  size = 'md',
  color = 'var(--tg-theme-text-color)',
  className = ''
}: UseIconProps) => {
  const IconComponent = Icons[name] as FC<any>;
  const iconSize = typeof size === 'string' ? sizeMap[size] : size;

  return (
    <IconComponent
      size={iconSize}
      color={color}
      variant={variant}
      className={className}
    />
  );
};
```

### 6.3 Система базовых иконок

#### Навигация и действия
```typescript
export const navigationIcons = {
  // Навигация
  back: 'ArrowLeft',
  forward: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  close: 'CloseCircle',

  // Основные действия
  add: 'Add',
  edit: 'Edit2',
  delete: 'Trash',
  copy: 'Copy',
  share: 'Share',
  save: 'DocumentDownload',

  // Поиск и фильтры
  search: 'SearchNormal1',
  filter: 'Setting4',
  sort: 'Sort',

  // Меню и настройки
  menu: 'HambergerMenu',
  settings: 'Setting2',
  more: 'More'
} as const;
```

#### Контент и медиа
```typescript
export const contentIcons = {
  // Типы контента
  text: 'DocumentText',
  image: 'Gallery',
  video: 'VideoPlay',
  link: 'Link21',
  file: 'Document',

  // Контент-блоки
  grid: 'Grid3',
  list: 'MenuBoard',
  card: 'Card',
  feed: 'Bookmark',

  // Медиа действия
  play: 'Play',
  pause: 'Pause',
  download: 'ArrowDown3',
  upload: 'ArrowUp3'
} as const;
```

#### Пользователь и статусы
```typescript
export const userIcons = {
  // Пользователь
  user: 'Profile',
  users: 'ProfileTick',
  avatar: 'UserSquare',

  // Взаимодействия
  like: 'Heart',
  favorite: 'Star1',
  bookmark: 'Bookmark',

  // Статусы
  success: 'TickCircle',
  warning: 'InfoCircle',
  error: 'CloseCircle',
  info: 'InfoCircle',
  loading: 'Loading'
} as const;
```

#### Бизнес и аналитика
```typescript
export const businessIcons = {
  // Аналитика
  analytics: 'Chart21',
  chart: 'TrendUp',
  stats: 'ChartSquare',

  // Время и планирование
  calendar: 'Calendar1',
  clock: 'Clock',
  timer: 'Timer1',

  // Финансы
  money: 'MoneyRecive',
  payment: 'Card',
  subscription: 'Crown1',

  // Уведомления
  notification: 'Notification',
  bell: 'NotificationBing',
  message: 'Sms'
} as const;
```

### 6.4 Правила использования стилей

#### Linear (основной стиль)
- Навигационные элементы
- Текстовые поля и формы
- Списки и таблицы
- Второстепенные действия

```typescript
import { ArrowLeft, SearchNormal1, DocumentText } from 'iconsax-react';

<ArrowLeft size="24" variant="Linear" />
<SearchNormal1 size="20" variant="Linear" />
<DocumentText size="16" variant="Linear" />
```

#### Bold (акцентный стиль)
- Активные состояния
- Основные действия (CTA)
- Выбранные элементы
- Важные уведомления

```typescript
import { Add, Heart, Star1 } from 'iconsax-react';

<Add size="24" variant="Bold" color="var(--color-primary)" />
<Heart size="20" variant="Bold" color="var(--color-error)" />
<Star1 size="16" variant="Bold" color="var(--color-warning)" />
```

#### Animated (интерактивный стиль)
- Состояния загрузки
- Переходы между экранами
- Hover эффекты
- Интерактивные элементы

```typescript
import { Loading, RefreshCircle, ArrowRight } from 'iconsax-react';

<Loading
  size="24"
  variant="Linear"
  className="animate-spin"
/>
<RefreshCircle
  size="20"
  variant="Bold"
  className="animate-pulse hover:animate-spin"
/>
```

### 6.5 Иллюстрации

#### Стиль иллюстраций
- **Минимализм:** Простые, понятные изображения
- **Цветовая гамма:** Соответствие цветовой палитре приложения
- **Размеры:** 200×200px, 300×300px, 400×400px

#### Иллюстрации для онбординга
```typescript
const illustrations = {
  onboarding: {
    value: 'navigation-concept.svg',
    instruction: 'page-builder.svg',
    publish: 'share-link.svg'
  },

  emptyStates: {
    noPages: 'empty-pages.svg',
    noCards: 'empty-cards.svg',
    noAnalytics: 'empty-analytics.svg'
  },

  errors: {
    networkError: 'network-error.svg',
    serverError: 'server-error.svg',
    notFound: 'not-found.svg'
  },

  success: {
    pageCreated: 'page-created.svg',
    pagePublished: 'page-published.svg',
    subscriptionActive: 'subscription-success.svg'
  }
};
```

---

## 7. Анимации и переходы

### 7.1 Принципы анимации

#### Временные функции
```css
:root {
  /* Easing functions */
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
  --ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-extra-slow: 500ms;
}
```

#### Базовые переходы
```css
.transition-fast { transition: all var(--duration-fast) var(--ease-out-quad); }
.transition-normal { transition: all var(--duration-normal) var(--ease-out-cubic); }
.transition-slow { transition: all var(--duration-slow) var(--ease-in-out-cubic); }

/* Специфичные переходы */
.transition-colors { transition: color var(--duration-fast), background-color var(--duration-fast), border-color var(--duration-fast); }
.transition-opacity { transition: opacity var(--duration-normal) var(--ease-out-quad); }
.transition-transform { transition: transform var(--duration-normal) var(--ease-out-cubic); }
```

### 7.2 Микроанимации

#### Hover эффекты
```css
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out-cubic);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale {
  transition: transform var(--duration-fast) var(--ease-out-quad);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow {
  transition: box-shadow var(--duration-normal) var(--ease-out-quad);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(var(--tg-theme-button-color), 0.3);
}
```

#### Touch feedback
```css
.touch-feedback {
  transition: transform var(--duration-fast) var(--ease-out-quad);
}

.touch-feedback:active {
  transform: scale(0.98);
}

/* Для кнопок */
.button-touch:active {
  transform: scale(0.96);
}

/* Для карточек */
.card-touch:active {
  transform: scale(0.99);
}
```

### 7.3 Анимации загрузки

#### Пульсация
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Вращение
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}
```

#### Мерцание
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### 7.4 Переходы между экранами

#### Слайд анимации
```css
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out-left {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
}

.animate-slide-in-right {
  animation: slide-in-right var(--duration-normal) var(--ease-out-cubic);
}

.animate-slide-out-left {
  animation: slide-out-left var(--duration-normal) var(--ease-out-cubic);
}
```

#### Fade анимации
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.animate-fade-in {
  animation: fade-in var(--duration-normal) var(--ease-out-quad);
}

.animate-fade-out {
  animation: fade-out var(--duration-normal) var(--ease-out-quad);
}
```

#### Scale анимации
```css
@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scale-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}

.animate-scale-in {
  animation: scale-in var(--duration-normal) var(--ease-out-cubic);
}

.animate-scale-out {
  animation: scale-out var(--duration-normal) var(--ease-out-cubic);
}
```

### 7.5 Анимации списков

#### Staggered анимации
```css
.stagger-children > * {
  animation: fade-slide-up var(--duration-normal) var(--ease-out-cubic) both;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 7.6 Haptic Feedback Integration

#### Haptic mapping
```typescript
const hapticMapping = {
  // Touch interactions
  light: 'light',      // Касания, переключения
  medium: 'medium',    // Кнопки, подтверждения
  heavy: 'heavy',      // Важные действия

  // Notifications
  success: 'success',  // Успешные операции
  warning: 'warning',  // Предупреждения
  error: 'error',      // Ошибки

  // Selection
  selection: 'selection' // Выбор элементов
};
```

#### CSS классы для haptic events
```css
.haptic-light:active { /* Стили для легкого тактильного отклика */ }
.haptic-medium:active { /* Стили для среднего тактильного отклика */ }
.haptic-heavy:active { /* Стили для сильного тактильного отклика */ }
```

---

## 8. Layout patterns

### 8.1 Основные макеты страниц

#### Главный экран
```css
.layout-main {
  min-height: 100vh;
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
}

.layout-header {
  padding: var(--space-4) var(--space-4) var(--space-2);
  background-color: var(--tg-theme-header-bg-color);
  border-bottom: 1px solid var(--color-neutral-200);
  position: sticky;
  top: 0;
  z-index: 100;
}

.layout-content {
  padding: var(--space-4);
  flex: 1;
}

.layout-footer {
  padding: var(--space-4);
  background-color: var(--tg-theme-secondary-bg-color);
  border-top: 1px solid var(--color-neutral-200);
  margin-top: auto;
}
```

#### Страница с навигацией
```css
.layout-with-nav {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-nav {
  background-color: var(--tg-theme-header-bg-color);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: var(--space-2) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.layout-nav-back {
  color: var(--tg-theme-link-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.layout-nav-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--tg-theme-text-color);
  flex: 1;
  text-align: center;
}

.layout-nav-actions {
  display: flex;
  gap: var(--space-2);
}
```

#### Modal layout
```css
.layout-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 1000;
}

.layout-modal-content {
  background-color: var(--tg-theme-bg-color);
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.layout-modal-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.layout-modal-body {
  padding: var(--space-4) var(--space-6);
  flex: 1;
}

.layout-modal-footer {
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
```

### 8.2 Макеты для карточек

#### Вертикальный список
```css
.layout-vertical-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.layout-vertical-list-item {
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 16px;
  padding: var(--space-4);
  border: 1px solid var(--color-neutral-200);
}
```

#### Сетка 2 колонки
```css
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.layout-grid-item {
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
}

/* Адаптивная сетка */
@media (max-width: 640px) {
  .layout-grid {
    gap: var(--space-3);
  }
}

@media (min-width: 768px) {
  .layout-grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Горизонтальный скролл
```css
.layout-horizontal-scroll {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  padding: var(--space-2) 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.layout-horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.layout-horizontal-scroll-item {
  flex: 0 0 200px;
  scroll-snap-align: start;
}

/* Показать скроллбар на десктопе */
@media (min-width: 1024px) {
  .layout-horizontal-scroll::-webkit-scrollbar {
    display: block;
    height: 6px;
  }

  .layout-horizontal-scroll::-webkit-scrollbar-track {
    background: var(--color-neutral-100);
    border-radius: 3px;
  }

  .layout-horizontal-scroll::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300);
    border-radius: 3px;
  }
}
```

#### Лента (Feed)
```css
.layout-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.layout-feed-item {
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--color-neutral-200);
}

.layout-feed-image {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
}

.layout-feed-content {
  padding: var(--space-5);
}
```

### 8.3 Responsive layouts

#### Container система
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }

/* Адаптивные отступы */
@media (min-width: 640px) {
  .container { padding: 0 var(--space-6); }
}

@media (min-width: 1024px) {
  .container { padding: 0 var(--space-8); }
}
```

#### Grid система
```css
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Адаптивные колонки */
@media (max-width: 640px) {
  .sm\:grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

### 8.4 Safe areas

#### Поддержка Safe Area
```css
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}

.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## 9. Специфика Telegram Mini Apps

### 9.1 Telegram WebApp CSS переменные

#### Интеграция с темой Telegram
```css
:root {
  /* Применение Telegram переменных */
  --app-bg: var(--tg-theme-bg-color, #ffffff);
  --app-text: var(--tg-theme-text-color, #000000);
  --app-hint: var(--tg-theme-hint-color, #999999);
  --app-link: var(--tg-theme-link-color, #2481cc);
  --app-button: var(--tg-theme-button-color, #2481cc);
  --app-button-text: var(--tg-theme-button-text-color, #ffffff);
  --app-secondary-bg: var(--tg-theme-secondary-bg-color, #f1f1f1);
  --app-header-bg: var(--tg-theme-header-bg-color, #ffffff);
  --app-accent: var(--tg-theme-accent-text-color, #2481cc);
  --app-section-bg: var(--tg-theme-section-bg-color, #ffffff);
  --app-section-header: var(--tg-theme-section-header-text-color, #6d6d71);
  --app-subtitle: var(--tg-theme-subtitle-text-color, #999999);
  --app-destructive: var(--tg-theme-destructive-text-color, #ff3b30);
}

/* Автоматическое применение к корневому элементу */
.twa-root {
  background-color: var(--app-bg);
  color: var(--app-text);
}
```

#### Реактивность на изменения темы
```typescript
// TypeScript функция для обновления CSS переменных
function updateTelegramTheme(themeParams: any) {
  const root = document.documentElement;

  if (themeParams.bg_color) {
    root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
  }
  if (themeParams.text_color) {
    root.style.setProperty('--tg-theme-text-color', themeParams.text_color);
  }
  if (themeParams.hint_color) {
    root.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
  }
  if (themeParams.link_color) {
    root.style.setProperty('--tg-theme-link-color', themeParams.link_color);
  }
  if (themeParams.button_color) {
    root.style.setProperty('--tg-theme-button-color', themeParams.button_color);
  }
  if (themeParams.button_text_color) {
    root.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
  }
}
```

### 9.2 MainButton и BackButton

#### MainButton стилизация
```css
.telegram-main-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  border: none;
  padding: var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  text-align: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease;
}

.telegram-main-button:active {
  opacity: 0.8;
}

.telegram-main-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Прогресс для MainButton */
.telegram-main-button-progress {
  position: relative;
  overflow: hidden;
}

.telegram-main-button-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: progress-slide 1.5s ease-in-out infinite;
}

@keyframes progress-slide {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

#### BackButton интеграция
```css
.telegram-back-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--tg-theme-link-color);
  text-decoration: none;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  padding: var(--space-2);
  margin: var(--space-2) 0;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.telegram-back-button:hover {
  background-color: var(--color-neutral-100);
}

.telegram-back-button-icon {
  width: 20px;
  height: 20px;
}
```

### 9.3 Viewport и адаптивность

#### Viewport настройки
```css
/* Учет специфики Telegram WebApp viewport */
.twa-viewport {
  min-height: 100vh;
  min-height: var(--tg-viewport-height, 100vh);
  min-height: var(--tg-viewport-stable-height, 100vh);
}

/* Адаптация под расширенный режим */
.twa-expanded {
  height: 100vh;
  height: var(--tg-viewport-height, 100vh);
}

/* Компенсация для MainButton */
.content-with-main-button {
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}
```

#### Keyboard-aware layout
```css
/* Адаптация под клавиатуру */
.keyboard-aware {
  min-height: 100vh;
  min-height: var(--tg-viewport-stable-height, 100vh);
}

.keyboard-aware.keyboard-visible {
  height: var(--tg-viewport-height, 100vh);
  overflow: hidden;
}
```

### 9.4 Haptic Feedback стили

#### Визуальная обратная связь
```css
.haptic-feedback {
  transition: transform 0.1s ease;
}

.haptic-feedback:active {
  transform: scale(0.98);
}

.haptic-light:active {
  transform: scale(0.99);
}

.haptic-medium:active {
  transform: scale(0.97);
}

.haptic-heavy:active {
  transform: scale(0.95);
}

/* Кастомные эффекты для haptic */
.haptic-success {
  position: relative;
}

.haptic-success::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 2px solid var(--color-success);
  border-radius: inherit;
  opacity: 0;
  animation: haptic-pulse 0.3s ease-out;
}

@keyframes haptic-pulse {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0;
    transform: scale(1.1);
  }
}
```

### 9.5 Platform-specific стили

#### iOS специфичные стили
```css
.ios .button {
  border-radius: 14px;
}

.ios .input {
  border-radius: 10px;
  font-size: 16px; /* Предотвращение zoom на iOS */
}

.ios .card {
  border-radius: 16px;
}
```

#### Android специфичные стили
```css
.android .button {
  border-radius: 8px;
}

.android .input {
  border-radius: 6px;
}

.android .card {
  border-radius: 12px;
}
```

#### Desktop адаптации
```css
@media (min-width: 768px) and (pointer: fine) {
  .button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
}
```

---

## 10. Примеры кода

### 10.1 React компоненты с дизайн-системой

#### Button компонент
```typescript
import React from 'react';
import { cn } from '@/utils/cn';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  haptic?: 'light' | 'medium' | 'heavy';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  haptic = 'medium',
  fullWidth = false,
  children,
  onClick,
  disabled,
  className,
  ...props
}) => {
  const { hapticFeedback } = useTelegramWebApp();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && hapticFeedback) {
      hapticFeedback('impact', haptic);
    }
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'button',
        `button-${variant}`,
        `button-${size}`,
        {
          'button-full': fullWidth,
          'button-loading': isLoading,
        },
        className
      )}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="spinner spinner-sm" />
      ) : (
        children
      )}
    </button>
  );
};
```

#### VerticalCard компонент
```typescript
import React from 'react';
import { cn } from '@/utils/cn';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useIcon } from '@/hooks/useIcon';
import * as Icons from 'iconsax-react';

interface VerticalCardProps {
  title: string;
  description?: string;
  iconName?: keyof typeof Icons;
  iconUrl?: string;
  iconVariant?: 'Linear' | 'Bold';
  onClick: () => void;
  className?: string;
}

export const VerticalCard: React.FC<VerticalCardProps> = ({
  title,
  description,
  iconName,
  iconUrl,
  iconVariant = 'Linear',
  onClick,
  className
}) => {
  const { hapticFeedback } = useTelegramWebApp();

  const handleClick = () => {
    if (hapticFeedback) {
      hapticFeedback('impact', 'light');
    }
    onClick();
  };

  const renderIcon = () => {
    if (iconUrl) {
      return <img src={iconUrl} alt="" className="w-6 h-6 object-cover rounded" />;
    }

    if (iconName) {
      const IconComponent = Icons[iconName] as React.FC<any>;
      return (
        <IconComponent
          size="24"
          color="var(--tg-theme-text-color)"
          variant={iconVariant}
        />
      );
    }

    return <div className="w-6 h-6 bg-gray-300 rounded" />;
  };

  return (
    <div
      className={cn('card-vertical haptic-light', className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="card-vertical-icon">
        {renderIcon()}
      </div>

      <div className="card-vertical-content">
        <h3 className="card-vertical-title">{title}</h3>
        {description && (
          <p className="card-vertical-description">{description}</p>
        )}
      </div>
    </div>
  );
};

// Пример использования:
// <VerticalCard
//   title="Настройки"
//   description="Управление аккаунтом"
//   iconName="Setting2"
//   iconVariant="Linear"
//   onClick={() => {}}
// />
```

#### Modal компонент
```typescript
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const { hapticFeedback } = useTelegramWebApp();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (hapticFeedback) {
        hapticFeedback('impact', 'light');
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, hapticFeedback]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className={cn('modal animate-scale-in', `modal-${size}`)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              className="button-ghost button-sm"
              onClick={onClose}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        )}

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

### 10.2 Custom hooks для дизайн-системы

#### useTheme hook
```typescript
import { useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface ThemeColors {
  bg: string;
  text: string;
  hint: string;
  link: string;
  button: string;
  buttonText: string;
  secondaryBg: string;
}

export const useTheme = () => {
  const { webApp } = useTelegramWebApp();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colors, setColors] = useState<ThemeColors>({
    bg: '#ffffff',
    text: '#000000',
    hint: '#999999',
    link: '#2481cc',
    button: '#2481cc',
    buttonText: '#ffffff',
    secondaryBg: '#f1f1f1'
  });

  useEffect(() => {
    if (webApp?.themeParams) {
      const themeParams = webApp.themeParams;

      setColors({
        bg: themeParams.bg_color || '#ffffff',
        text: themeParams.text_color || '#000000',
        hint: themeParams.hint_color || '#999999',
        link: themeParams.link_color || '#2481cc',
        button: themeParams.button_color || '#2481cc',
        buttonText: themeParams.button_text_color || '#ffffff',
        secondaryBg: themeParams.secondary_bg_color || '#f1f1f1'
      });

      // Определение темы на основе цвета фона
      const bgColor = themeParams.bg_color || '#ffffff';
      const rgb = parseInt(bgColor.slice(1), 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      setTheme(brightness > 128 ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', brightness > 128 ? 'light' : 'dark');
    }
  }, [webApp]);

  return { theme, colors };
};
```

#### useHapticFeedback hook
```typescript
import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

type HapticType = 'impact' | 'notification' | 'selection';
type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'error' | 'success' | 'warning';

export const useHapticFeedback = () => {
  const { webApp } = useTelegramWebApp();

  const impact = useCallback((style: ImpactStyle = 'medium') => {
    webApp?.HapticFeedback?.impactOccurred(style);
  }, [webApp]);

  const notification = useCallback((type: NotificationType = 'success') => {
    webApp?.HapticFeedback?.notificationOccurred(type);
  }, [webApp]);

  const selection = useCallback(() => {
    webApp?.HapticFeedback?.selectionChanged();
  }, [webApp]);

  const haptic = useCallback((type: HapticType, param?: ImpactStyle | NotificationType) => {
    switch (type) {
      case 'impact':
        impact(param as ImpactStyle);
        break;
      case 'notification':
        notification(param as NotificationType);
        break;
      case 'selection':
        selection();
        break;
    }
  }, [impact, notification, selection]);

  return {
    impact,
    notification,
    selection,
    haptic
  };
};
```

### 10.3 Tailwind CSS конфигурация

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Telegram theme colors
        'tg-bg': 'var(--tg-theme-bg-color, #ffffff)',
        'tg-text': 'var(--tg-theme-text-color, #000000)',
        'tg-hint': 'var(--tg-theme-hint-color, #999999)',
        'tg-link': 'var(--tg-theme-link-color, #2481cc)',
        'tg-button': 'var(--tg-theme-button-color, #2481cc)',
        'tg-button-text': 'var(--tg-theme-button-text-color, #ffffff)',
        'tg-secondary-bg': 'var(--tg-theme-secondary-bg-color, #f1f1f1)',

        // App semantic colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: 'var(--tg-theme-button-color, #3b82f6)',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        success: '#10b981',
        warning: '#f59e0b',
        error: 'var(--tg-theme-destructive-text-color, #ef4444)',
        info: 'var(--tg-theme-link-color, #3b82f6)',
      },

      fontFamily: {
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },

      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      borderRadius: {
        'tg': '12px',
        'tg-lg': '16px',
        'tg-xl': '20px',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },

      boxShadow: {
        'tg': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'tg-lg': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'tg-xl': '0 8px 24px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};
```

---

## 11. Responsive Design

### 11.1 Breakpoints и адаптивность

#### Система breakpoints
```css
:root {
  --breakpoint-xs: 475px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

#### Mobile-first подход
```css
/* Базовые стили для мобильных устройств */
.responsive-container {
  padding: var(--space-4);
  font-size: var(--text-base);
}

/* Планшеты */
@media (min-width: 768px) {
  .responsive-container {
    padding: var(--space-6);
    font-size: var(--text-lg);
  }
}

/* Десктоп */
@media (min-width: 1024px) {
  .responsive-container {
    padding: var(--space-8);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### 11.2 Адаптивная типографика

#### Fluid typography
```css
:root {
  --text-fluid-sm: clamp(0.75rem, 2vw, 0.875rem);
  --text-fluid-base: clamp(0.875rem, 2.5vw, 1rem);
  --text-fluid-lg: clamp(1rem, 3vw, 1.125rem);
  --text-fluid-xl: clamp(1.125rem, 3.5vw, 1.25rem);
  --text-fluid-2xl: clamp(1.25rem, 4vw, 1.5rem);
  --text-fluid-3xl: clamp(1.5rem, 5vw, 1.875rem);
}

.heading-fluid {
  font-size: var(--text-fluid-3xl);
  line-height: 1.2;
}

.body-fluid {
  font-size: var(--text-fluid-base);
  line-height: 1.6;
}
```

### 11.3 Адаптивные сетки

#### CSS Grid адаптивность
```css
.adaptive-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.adaptive-grid-cards {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .adaptive-grid-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .adaptive-grid-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Container queries (будущее)
```css
/* Когда поддержка станет лучше */
@container (min-width: 400px) {
  .card-container .card {
    flex-direction: row;
  }
}

@container (min-width: 600px) {
  .card-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 11.4 Touch и pointer адаптации

#### Touch-specific стили
```css
/* Стили для touch устройств */
@media (pointer: coarse) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  .button {
    padding: var(--space-4) var(--space-5);
    font-size: var(--text-lg);
  }

  .input {
    font-size: 16px; /* Предотвращение zoom на iOS */
  }
}

/* Стили для точных указательных устройств */
@media (pointer: fine) {
  .hover-effects:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .button {
    padding: var(--space-3) var(--space-4);
  }
}
```

---

## 12. Темы и кастомизация

### 12.1 Dark/Light режимы

#### Автоматическая тема
```css
/* Светлая тема (по умолчанию) */
:root {
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-border: #e5e5e5;
  --color-surface: #f9f9f9;
}

/* Темная тема */
[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
  --color-border: #333333;
  --color-surface: #2a2a2a;
}

/* Предпочтения системы */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-bg: #1a1a1a;
    --color-text: #ffffff;
    --color-border: #333333;
    --color-surface: #2a2a2a;
  }
}
```

#### Переключение тем
```typescript
// Theme switcher component
const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;

    if (newTheme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', newTheme);
    }

    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="theme-switcher">
      <button onClick={() => handleThemeChange('light')}>☀️ Светлая</button>
      <button onClick={() => handleThemeChange('dark')}>🌙 Темная</button>
      <button onClick={() => handleThemeChange('auto')}>🔄 Авто</button>
    </div>
  );
};
```

### 12.2 Кастомизация для Free/Pro

#### Pro enhanced стили
```css
/* Базовые стили для всех пользователей */
.card-base {
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 16px;
  padding: var(--space-4);
  transition: all 0.2s ease;
}

/* Улучшенные стили для Pro */
.pro-user .card-base {
  background: linear-gradient(135deg, var(--tg-theme-section-bg-color) 0%, var(--color-neutral-50) 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.pro-user .card-base:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Pro badges */
.pro-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  padding: var(--space-1) var(--space-2);
  border-radius: 8px;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### Ограничения для Free версии
```css
/* Визуальные индикаторы ограничений */
.free-limitation {
  position: relative;
  opacity: 0.6;
  pointer-events: none;
}

.free-limitation::after {
  content: 'Pro функция';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

/* Призыв к апгрейду */
.upgrade-prompt {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--space-4);
  border-radius: 16px;
  text-align: center;
  margin: var(--space-6) 0;
}

.upgrade-prompt-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
}

.upgrade-prompt-description {
  font-size: var(--text-sm);
  opacity: 0.9;
  margin-bottom: var(--space-4);
}

.upgrade-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: var(--space-3) var(--space-6);
  border-radius: 12px;
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.upgrade-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}
```

### 12.3 Platform адаптации

#### iOS стилизация
```css
.platform-ios {
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 20px;
}

.platform-ios .button {
  border-radius: var(--border-radius-md);
  font-weight: var(--font-semibold);
}

.platform-ios .input {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-neutral-300);
}

.platform-ios .card {
  border-radius: var(--border-radius-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

#### Android стилизация
```css
.platform-android {
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
}

.platform-android .button {
  border-radius: var(--border-radius-md);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.platform-android .input {
  border-radius: var(--border-radius-sm);
  border: none;
  border-bottom: 2px solid var(--color-neutral-300);
  background-color: transparent;
}

.platform-android .card {
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

---

## 12. Техническая интеграция

### 12.1 Настройка Iconsax в проекте

#### Установка зависимостей
```bash
# Основная библиотека иконок
npm install iconsax-react

# Дополнительно для оптимизации
npm install --save-dev babel-plugin-import
```

#### Конфигурация Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['iconsax-react']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          icons: ['iconsax-react']
        }
      }
    }
  }
});
```

#### TypeScript конфигурация
```typescript
// src/types/icons.ts
import * as Icons from 'iconsax-react';

export type IconName = keyof typeof Icons;
export type IconVariant = 'Linear' | 'Bold' | 'Bulk' | 'Broken' | 'TwoTone';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface IconProps {
  name: IconName;
  variant?: IconVariant;
  size?: IconSize;
  color?: string;
  className?: string;
}
```

### 12.2 Система управления иконками

#### Централизованный провайдер иконок
```typescript
// src/providers/IconProvider.tsx
import React, { createContext, useContext } from 'react';
import * as Icons from 'iconsax-react';
import { IconProps, IconName, IconVariant } from '@/types/icons';

interface IconContextType {
  getIcon: (name: IconName, props?: Partial<IconProps>) => React.ReactNode;
  iconRegistry: Record<string, IconName>;
}

const IconContext = createContext<IconContextType | null>(null);

const sizeMap = {
  xs: 16, sm: 20, md: 24, lg: 32, xl: 48, '2xl': 64
};

export const IconProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getIcon = (name: IconName, props: Partial<IconProps> = {}) => {
    const IconComponent = Icons[name] as React.FC<any>;
    const size = typeof props.size === 'string'
      ? sizeMap[props.size]
      : props.size || 24;

    return (
      <IconComponent
        size={size}
        color={props.color || 'var(--tg-theme-text-color)'}
        variant={props.variant || 'Linear'}
        className={props.className}
      />
    );
  };

  const iconRegistry = {
    // Навигация
    'nav.back': 'ArrowLeft',
    'nav.forward': 'ArrowRight',
    'nav.close': 'CloseCircle',
    'nav.menu': 'HambergerMenu',

    // Действия
    'action.add': 'Add',
    'action.edit': 'Edit2',
    'action.delete': 'Trash',
    'action.save': 'DocumentDownload',
    'action.share': 'Share',
    'action.search': 'SearchNormal1',

    // Контент
    'content.text': 'DocumentText',
    'content.image': 'Gallery',
    'content.video': 'VideoPlay',
    'content.link': 'Link21',

    // Статусы
    'status.success': 'TickCircle',
    'status.error': 'CloseCircle',
    'status.warning': 'InfoCircle',
    'status.loading': 'Loading',

    // Пользователь
    'user.profile': 'Profile',
    'user.settings': 'Setting2',

    // Бизнес
    'business.analytics': 'Chart21',
    'business.money': 'MoneyRecive',
    'business.crown': 'Crown1'
  } as Record<string, IconName>;

  return (
    <IconContext.Provider value={{ getIcon, iconRegistry }}>
      {children}
    </IconContext.Provider>
  );
};

export const useIconProvider = () => {
  const context = useContext(IconContext);
  if (!context) {
    throw new Error('useIconProvider must be used within IconProvider');
  }
  return context;
};
```

#### Hook для удобного использования иконок
```typescript
// src/hooks/useIcon.ts
import { useIconProvider } from '@/providers/IconProvider';
import { IconProps, IconName } from '@/types/icons';

export const useIcon = () => {
  const { getIcon, iconRegistry } = useIconProvider();

  const getByKey = (key: string, props?: Partial<IconProps>) => {
    const iconName = iconRegistry[key];
    if (!iconName) {
      console.warn(`Icon key "${key}" not found in registry`);
      return null;
    }
    return getIcon(iconName, props);
  };

  const getByName = (name: IconName, props?: Partial<IconProps>) => {
    return getIcon(name, props);
  };

  return {
    icon: getByName,
    iconKey: getByKey,
    registry: iconRegistry
  };
};
```

### 12.3 Оптимизация и производительность

#### Tree-shaking конфигурация
```typescript
// babel.config.js
module.exports = {
  plugins: [
    [
      'import',
      {
        libraryName: 'iconsax-react',
        camel2DashComponentName: false,
        customStyleName: false
      }
    ]
  ]
};
```

#### Ленивая загрузка иконок
```typescript
// src/components/LazyIcon.tsx
import React, { lazy, Suspense } from 'react';
import { IconProps, IconName } from '@/types/icons';

const iconCache = new Map<IconName, React.ComponentType<any>>();

export const LazyIcon: React.FC<IconProps> = ({ name, ...props }) => {
  if (!iconCache.has(name)) {
    const IconComponent = lazy(() =>
      import('iconsax-react').then(module => ({
        default: module[name] as React.ComponentType<any>
      }))
    );
    iconCache.set(name, IconComponent);
  }

  const IconComponent = iconCache.get(name)!;

  return (
    <Suspense fallback={<div className="w-6 h-6 animate-pulse bg-gray-200 rounded" />}>
      <IconComponent {...props} />
    </Suspense>
  );
};
```

### 12.4 Примеры интеграции в компоненты

#### Button с иконкой
```typescript
// src/components/Button.tsx
import React from 'react';
import { useIcon } from '@/hooks/useIcon';
import { IconName } from '@/types/icons';

interface ButtonWithIconProps {
  children: React.ReactNode;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  variant?: 'primary' | 'secondary';
}

export const ButtonWithIcon: React.FC<ButtonWithIconProps> = ({
  children,
  icon,
  iconPosition = 'left',
  variant = 'primary'
}) => {
  const { icon: getIcon } = useIcon();

  const iconElement = icon ? getIcon(icon, { size: 'sm', variant: 'Bold' }) : null;

  return (
    <button className={`button button-${variant}`}>
      {iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {iconPosition === 'right' && iconElement}
    </button>
  );
};
```

#### Универсальный Icon компонент
```typescript
// src/components/Icon.tsx
import React from 'react';
import { useIcon } from '@/hooks/useIcon';
import { IconProps } from '@/types/icons';

export const Icon: React.FC<IconProps> = (props) => {
  const { icon } = useIcon();
  return <>{icon(props.name, props)}</>;
};

// Использование:
// <Icon name="ArrowLeft" size="md" variant="Bold" />
// <Icon name="Setting2" size={20} color="#FF5722" />
```

### 12.5 Миграция с Emoji

#### Скрипт автоматической замены
```typescript
// scripts/migrate-emoji-to-icons.ts
const emojiToIconMap = {
  '📱': 'Mobile',
  '🎯': 'Target',
  '💼': 'Briefcase',
  '📊': 'Chart21',
  '🔒': 'Lock',
  '👤': 'Profile',
  '💰': 'MoneyRecive',
  '📈': 'TrendUp',
  '🎨': 'ColorSwatch',
  '⚙️': 'Setting2',
  '📋': 'ClipboardTick',
  '🔍': 'SearchNormal1',
  // ... и так далее
};

function migrateEmojiToIcons(sourceCode: string): string {
  let result = sourceCode;

  Object.entries(emojiToIconMap).forEach(([emoji, iconName]) => {
    // Заменяем emoji в JSX
    result = result.replace(
      new RegExp(`{["']${emoji}["']}`, 'g'),
      `<Icon name="${iconName}" size="md" />`
    );

    // Заменяем emoji в строках
    result = result.replace(
      new RegExp(`["']${emoji}["']`, 'g'),
      `<Icon name="${iconName}" size="md" />`
    );
  });

  return result;
}
```

---

## Заключение

Данная дизайн-система обеспечивает:

✅ **Консистентность** — единообразный внешний вид во всех частях приложения
✅ **Адаптивность** — корректное отображение на всех устройствах
✅ **Интеграция с Telegram** — нативное ощущение в экосистеме Telegram
✅ **Accessibility** — доступность для всех пользователей
✅ **Производительность** — оптимизированные анимации и переходы
✅ **Масштабируемость** — легкое добавление новых компонентов
✅ **Developer Experience** — удобство использования для разработчиков

### Следующие шаги

1. **Имплементация базовых компонентов** в соответствии со спецификацией
2. **Создание Storybook** для документации компонентов
3. **Настройка автоматических тестов** визуального регрессии
4. **Интеграция с дизайн-токенами** для синхронизации с Figma
5. **Оптимизация bundle size** и производительности

### Поддержка и обновления

Дизайн-система будет развиваться вместе с проектом:
- Добавление новых компонентов по мере необходимости
- Оптимизация на основе пользовательской обратной связи
- Обновление в соответствии с изменениями в Telegram WebApp API
- Улучшение доступности и производительности

---

*Дизайн-система Navigapp v1.0 — создана для обеспечения превосходного пользовательского опыта в экосистеме Telegram Mini Apps.*