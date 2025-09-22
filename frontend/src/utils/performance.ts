// Утилиты для оптимизации производительности

// Debounce функция для ограничения частоты вызовов
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle функция для ограничения частоты выполнения
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Мемоизация для кэширования результатов вычислений
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Проверка поддержки Intersection Observer
export const isIntersectionObserverSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
};

// Создание Intersection Observer с fallback
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (!isIntersectionObserverSupported()) {
    return null;
  }
  return new IntersectionObserver(callback, options);
};

// Prefetch для предзагрузки ресурсов
export const prefetchResource = (href: string, type: 'image' | 'script' | 'style' = 'image') => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = href;
  document.head.appendChild(link);
};

// Определение медленного соединения
export const isSlowConnection = (): boolean => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection;
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    (connection.downlink && connection.downlink < 1.5)
  );
};

// Адаптивная загрузка изображений
export const getOptimalImageSrc = (
  baseSrc: string,
  width: number,
  isRetina: boolean = window.devicePixelRatio > 1
): string => {
  if (isSlowConnection()) {
    // Для медленного соединения используем уменьшенное изображение
    return `${baseSrc}?w=${Math.round(width * 0.7)}&q=70`;
  }

  const targetWidth = isRetina ? width * 2 : width;
  return `${baseSrc}?w=${targetWidth}&q=80`;
};

// Отложенное выполнение до idle состояния
export const runWhenIdle = (callback: () => void, timeout: number = 5000) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    // Fallback для браузеров без поддержки requestIdleCallback
    setTimeout(callback, 1);
  }
};

// Батчинг обновлений состояния
export class StateBatcher<T> {
  private pendingUpdates: ((state: T) => T)[] = [];
  private isUpdateScheduled = false;

  constructor(private setState: (updater: (state: T) => T) => void) {}

  addUpdate(updater: (state: T) => T) {
    this.pendingUpdates.push(updater);

    if (!this.isUpdateScheduled) {
      this.isUpdateScheduled = true;
      runWhenIdle(() => {
        const updates = [...this.pendingUpdates];
        this.pendingUpdates = [];
        this.isUpdateScheduled = false;

        this.setState((currentState) =>
          updates.reduce((state, update) => update(state), currentState)
        );
      });
    }
  }
}

// Виртуализация списков - простая реализация
export interface VirtualListItem {
  id: string;
  height: number;
}

export const calculateVisibleItems = (
  items: VirtualListItem[],
  scrollTop: number,
  containerHeight: number,
  overscan: number = 3
) => {
  let startIndex = 0;
  let currentHeight = 0;

  // Находим первый видимый элемент
  for (let i = 0; i < items.length; i++) {
    if (currentHeight + items[i].height > scrollTop) {
      startIndex = Math.max(0, i - overscan);
      break;
    }
    currentHeight += items[i].height;
  }

  // Находим последний видимый элемент
  let endIndex = startIndex;
  let visibleHeight = 0;

  for (let i = startIndex; i < items.length; i++) {
    visibleHeight += items[i].height;
    endIndex = i;

    if (visibleHeight >= containerHeight + (overscan * 100)) {
      break;
    }
  }

  return {
    startIndex,
    endIndex: Math.min(endIndex + overscan, items.length - 1),
    offsetY: items.slice(0, startIndex).reduce((sum, item) => sum + item.height, 0)
  };
};