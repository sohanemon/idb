// Singleton database connections cache
const dbConnections = new Map<string, Promise<IDBDatabase>>();

/**
 * Check if IndexedDB is available
 */
export function isIDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

/**
 * Opens an IndexedDB database and ensures the specified store exists.
 * Uses singleton pattern to reuse connections for the same database and version.
 * Automatically increments version if the store doesn't exist.
 */
export function openDB(
  dbName: string,
  storeName: string,
  version = 1,
  onVersionChange?: () => void,
): Promise<IDBDatabase> {
  if (!isIDBAvailable()) {
    throw new Error('IndexedDB is not available in this environment');
  }
  const key = `${dbName}:${version}:${storeName}`;

  if (dbConnections.has(key)) {
    return dbConnections.get(key)!;
  }

  const dbPromise = _openDB(dbName, storeName, version, onVersionChange);
  dbConnections.set(key, dbPromise);

  return dbPromise;
}

/**
 * Internal function to open database with proper store handling
 */
function _openDB(
  dbName: string,
  storeName: string,
  version?: number,
  onVersionChange?: () => void,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => {
      const key = `${dbName}:${version ?? 'current'}:${storeName}`;
      dbConnections.delete(key);
      // If version error due to requested version being less than current, retry with current version
      if (
        request.error?.name === 'VersionError' &&
        request.error.message.includes('less than')
      ) {
        resolve(_openDB(dbName, storeName, undefined, onVersionChange));
        return;
      }
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const currentVersion = db.version;

      // Check if store exists, if not, we need to upgrade
      if (!db.objectStoreNames.contains(storeName)) {
        db.close();
        const key = `${dbName}:${version ?? 'current'}:${storeName}`;
        dbConnections.delete(key);
        // Try with higher version
        resolve(
          _openDB(dbName, storeName, currentVersion + 1, onVersionChange),
        );
        return;
      }

      // Handle version changes
      db.onversionchange = () => {
        db.close();
        // Clear all connections for this db
        for (const [key] of dbConnections) {
          if (key.startsWith(`${dbName}:`)) {
            dbConnections.delete(key);
          }
        }
        onVersionChange?.();
      };

      resolve(db);
    };
  });
}

/**
 * Gets a value from IndexedDB.
 */
export function getFromDB<T>(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Sets a value in IndexedDB.
 */
export function setInDB(
  db: IDBDatabase,
  storeName: string,
  key: string,
  value: any,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Removes a value from IndexedDB.
 */
export function removeFromDB(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    } catch (error) {
      reject(error);
    }
  });
}
