/**
 * Cross-platform UUID generator
 * Fallback for environments where crypto.randomUUID() is not available
 */

export function generateUUID(): string {
  // Try modern crypto.randomUUID first
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID failed, using fallback:', error);
    }
  }

  // Fallback implementation for older browsers/Telegram versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simple ID generator for cases where full UUID is not needed
export function generateSimpleId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}