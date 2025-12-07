/**
 * Opens an IndexedDB database and creates a store if it doesn't exist.
 */
export const openDB = (
  dbName: string,
  storeName: string,
  version = 1,
): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
};

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
