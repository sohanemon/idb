import { getGlobalConfig } from './config';
import { getFromDB, openDB, removeFromDB, setInDB } from './database';
import type { IDBConfigValues } from './types';

/**
 * IDBStore provides key-value operations for a specific IndexedDB object store.
 * Inspired by idb-keyval but with store-specific operations.
 */
export class IDBStore {
  private db: IDBDatabase;
  private storeName: string;

  constructor(db: IDBDatabase, storeName: string) {
    this.db = db;
    this.storeName = storeName;
  }

  /**
   * Get a value by key
   */
  async get<T>(key: string): Promise<T | undefined> {
    return getFromDB<T>(this.db, this.storeName, key);
  }

  /**
   * Set a value for a key
   */
  async set<T>(key: string, value: T): Promise<void> {
    return setInDB(this.db, this.storeName, key, value);
  }

  /**
   * Delete a key-value pair
   */
  async delete(key: string): Promise<void> {
    return removeFromDB(this.db, this.storeName, key);
  }

  /**
   * Get multiple values by keys
   */
  async getMany<T>(keys: string[]): Promise<(T | undefined)[]> {
    const promises = keys.map((key) => this.get<T>(key));
    return Promise.all(promises);
  }

  /**
   * Set multiple key-value pairs
   */
  async setMany<T>(entries: [string, T][]): Promise<void> {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const promises = entries.map(([key, value]) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(value, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });

    await Promise.all(promises);
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<void> {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const promises = keys.map((key) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    });

    await Promise.all(promises);
  }

  /**
   * Update a value using a transformer function
   */
  async update<T>(
    key: string,
    updater: (value: T | undefined) => T,
  ): Promise<void> {
    const currentValue = await this.get<T>(key);
    const newValue = updater(currentValue);
    await this.set(key, newValue);
  }

  /**
   * Clear all key-value pairs in the store
   */
  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all keys in the store
   */
  async keys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(Array.from(request.result) as string[]);
    });
  }
}

/**
 * IDBStorage provides access to IndexedDB with multiple stores.
 * Main entry point for database operations.
 */
export class IDBStorage {
  private config: IDBConfigValues;
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(config?: IDBConfigValues) {
    const defaultConfig = getGlobalConfig();

    this.config = {
      database: config?.database || defaultConfig.database,
      version:
        Math.max(1, Math.floor(config?.version || 1)) || defaultConfig.version,
      store: config?.store || defaultConfig.store,
    };
  }

  /**
   * Get or create the database connection
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = openDB(
      this.config.database,
      this.config.store,
      this.config.version,
      () => {
        // Reset the cached db when version changes
        this.db = null;
        this.dbPromise = null;
      },
    );
    this.db = await this.dbPromise;
    this.dbPromise = null;

    return this.db;
  }

  /**
   * Get a store instance by name
   */
  async get(storeName: string): Promise<IDBStore> {
    const db = await this.getDB();
    return new IDBStore(db, storeName);
  }

  /**
   * Get the default store instance
   */
  get store(): Promise<IDBStore> {
    return this.get(this.config.store);
  }

  /**
   * Drop/delete a specific store
   */
  async drop(storeName: string): Promise<void> {
    // Note: IndexedDB doesn't support dropping stores after creation
    // This would require a version upgrade with store deletion
    // For now, we'll clear the store instead
    const store = await this.get(storeName);
    await store.clear();
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
