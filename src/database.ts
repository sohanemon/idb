// Singleton database connections cache
const dbConnections = new Map<string, Promise<IDBDatabase>>();

/**
 * Opens an IndexedDB database and creates a store if it doesn't exist.
 * Uses singleton pattern to reuse connections for the same database.
 */
export function openDB(
  dbName: string,
  storeName: string,
  version = 1,
  onVersionChange?: () => void,
): Promise<IDBDatabase> {
  const key = `${dbName}:${version}:${storeName}`;

  if (dbConnections.has(key)) {
    return dbConnections.get(key)!;
  }

  const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => {
      dbConnections.delete(key);
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

      // Check if the store exists; if not, close and reopen with higher version
      if (!db.objectStoreNames.contains(storeName)) {
        db.close();
        dbConnections.delete(key);
        // Recursively open with higher version
        openDB(dbName, storeName, version + 1, onVersionChange)
          .then(resolve)
          .catch(reject);
        return;
      }

      // prevent forced-close issues
      db.onversionchange = () => {
        db.close();
        dbConnections.delete(key);
        onVersionChange?.();
      };

      resolve(db);
    };
  });

  dbConnections.set(key, dbPromise);
  return dbPromise;
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
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Sets a value in IndexedDB.
 */
export const setInDB = (
  db: IDBDatabase,
  storeName: string,
  key: string,
  value: any,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/**
 * Removes a value from IndexedDB.
 */
export const removeFromDB = (
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};
