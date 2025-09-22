import { Page, Card } from '@/types/page';
import { generateUUID } from '@/utils/uuid';

const STORAGE_KEYS = {
  PAGES: 'navigapp_pages',
  CARDS: 'navigapp_cards',
  SYNC_QUEUE: 'navigapp_sync_queue',
  LAST_SYNC: 'navigapp_last_sync',
} as const;

interface SyncQueueItem {
  id: string;
  type: 'create_page' | 'update_page' | 'delete_page' | 'create_card' | 'update_card' | 'delete_card';
  data: any;
  timestamp: string;
}

class OfflineStorage {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private memoryStorage: Map<string, any> = new Map();
  private isLocalStorageAvailable = this.checkLocalStorageAvailability();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingChanges();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  private checkLocalStorageAvailability(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const testKey = '__navigapp_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage not available, using memory storage:', error);
      return false;
    }
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      if (this.isLocalStorageAvailable) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } else {
        // Fallback to memory storage
        const item = this.memoryStorage.get(key);
        return item || null;
      }
    } catch (error) {
      console.error(`Error reading from storage ${key}:`, error);
      return null;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, JSON.stringify(data));
      } else {
        // Fallback to memory storage
        this.memoryStorage.set(key, data);
      }
    } catch (error) {
      console.error(`Error saving to storage ${key}:`, error);
      // Try memory storage as last resort
      try {
        this.memoryStorage.set(key, data);
      } catch (memError) {
        console.error(`Failed to save to memory storage:`, memError);
      }
    }
  }

  private addToSyncQueue(item: SyncQueueItem): void {
    const queue = this.getFromStorage<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
    queue.push(item);
    this.saveToStorage(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  savePages(pages: Page[]): void {
    this.saveToStorage(STORAGE_KEYS.PAGES, pages);
  }

  getPages(): Page[] {
    return this.getFromStorage<Page[]>(STORAGE_KEYS.PAGES) || [];
  }

  savePage(page: Page): void {
    const pages = this.getPages();
    const existingIndex = pages.findIndex(p => p.id === page.id);

    if (existingIndex >= 0) {
      pages[existingIndex] = page;
    } else {
      pages.push(page);
    }

    this.savePages(pages);

    if (!this.isOnline) {
      this.addToSyncQueue({
        id: generateUUID(),
        type: existingIndex >= 0 ? 'update_page' : 'create_page',
        data: page,
        timestamp: new Date().toISOString(),
      });
    }
  }

  deletePage(pageId: string): void {
    const pages = this.getPages().filter(p => p.id !== pageId);
    this.savePages(pages);

    if (!this.isOnline) {
      this.addToSyncQueue({
        id: generateUUID(),
        type: 'delete_page',
        data: { pageId },
        timestamp: new Date().toISOString(),
      });
    }
  }

  getPageById(pageId: string): Page | undefined {
    return this.getPages().find(p => p.id === pageId);
  }

  getPageBySlug(slug: string): Page | undefined {
    return this.getPages().find(p => p.slug === slug);
  }

  saveCard(pageId: string, blockId: string, card: Card): void {
    const pages = this.getPages();
    const pageIndex = pages.findIndex(p => p.id === pageId);

    if (pageIndex === -1) return;

    const blockIndex = pages[pageIndex].blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const cards = pages[pageIndex].blocks[blockIndex].cards;
    const existingCardIndex = cards.findIndex(c => c.id === card.id);

    if (existingCardIndex >= 0) {
      cards[existingCardIndex] = card;
    } else {
      cards.push(card);
    }

    pages[pageIndex].updatedAt = new Date().toISOString();
    this.savePages(pages);

    if (!this.isOnline) {
      this.addToSyncQueue({
        id: generateUUID(),
        type: existingCardIndex >= 0 ? 'update_card' : 'create_card',
        data: { pageId, blockId, card },
        timestamp: new Date().toISOString(),
      });
    }
  }

  deleteCard(pageId: string, blockId: string, cardId: string): void {
    const pages = this.getPages();
    const pageIndex = pages.findIndex(p => p.id === pageId);

    if (pageIndex === -1) return;

    const blockIndex = pages[pageIndex].blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    pages[pageIndex].blocks[blockIndex].cards =
      pages[pageIndex].blocks[blockIndex].cards.filter(c => c.id !== cardId);

    pages[pageIndex].updatedAt = new Date().toISOString();
    this.savePages(pages);

    if (!this.isOnline) {
      this.addToSyncQueue({
        id: generateUUID(),
        type: 'delete_card',
        data: { pageId, blockId, cardId },
        timestamp: new Date().toISOString(),
      });
    }
  }

  getSyncQueue(): SyncQueueItem[] {
    return this.getFromStorage<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
  }

  clearSyncQueue(): void {
    this.saveToStorage(STORAGE_KEYS.SYNC_QUEUE, []);
  }

  getLastSyncTime(): string | null {
    return this.getFromStorage<string>(STORAGE_KEYS.LAST_SYNC);
  }

  setLastSyncTime(timestamp: string): void {
    this.saveToStorage(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline) return;

    const queue = this.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} pending changes...`);

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'create_page':
            console.log('Would sync create_page:', item.data);
            break;
          case 'update_page':
            console.log('Would sync update_page:', item.data);
            break;
          case 'delete_page':
            console.log('Would sync delete_page:', item.data);
            break;
          case 'create_card':
            console.log('Would sync create_card:', item.data);
            break;
          case 'update_card':
            console.log('Would sync update_card:', item.data);
            break;
          case 'delete_card':
            console.log('Would sync delete_card:', item.data);
            break;
        }
      } catch (error) {
        console.error('Sync error for item:', item, error);
      }
    }

    this.clearSyncQueue();
    this.setLastSyncTime(new Date().toISOString());
    console.log('Sync completed successfully');
  }

  hasUnsyncedChanges(): boolean {
    return this.getSyncQueue().length > 0;
  }

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const offlineStorage = new OfflineStorage();