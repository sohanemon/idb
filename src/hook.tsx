import * as React from 'react';

/**
 * Global configuration for IDBStorage defaults.
 */
let globalConfig = {
  database: 'sohanemon-idb',
  store: 'default',
};

/**
 * Configure global defaults for IDBStorage.
 */
export function configureIDBStorage(config: {
  database?: string;
  store?: string;
}) {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Opens an IndexedDB database and creates a store if it doesn't exist.
 */
const openDB = (
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
function getFromDB<T>(
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
const setInDB = (
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
const removeFromDB = (
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

/**
 * Configuration options for IDBStorage.
 */
interface IDBStorageOptions<T extends Record<string, any>> {
  /** The key for the stored value */
  key: string;
  /** The default value if no value is found in IndexedDB */
  defaultValue: T;
  /** The name of the IndexedDB database (optional, defaults to global config) */
  database?: string;
  /** The name of the object store (optional, defaults to global config) */
  store?: string;
}

/**
 * Hook to persist state in IndexedDB with a clean object-based API.
 *
 * @param options - Configuration object containing key, defaultValue, and optional database/store names
 * @returns A tuple of the stored value, an async updater function, and a remove function.
 *
 * @example
 * ```tsx
 * // Configure global defaults (optional)
 * configureIDBStorage({
 *   database: 'myApp',
 *   store: 'data'
 * });
 *
 * const [userData, setUserData, removeUserData] = useIDBStorage({
 *   key: 'currentUser',
 *   defaultValue: { name: '', email: '' },
 *   // database: 'myApp', // optional, uses global default
 *   // store: 'users' // optional, uses global default
 * });
 *
 * // Update data
 * await setUserData({ name: 'John', email: 'john@example.com' });
 *
 * // Remove data
 * await removeUserData();
 * ```
 */
export function useIDBStorage<T extends Record<string, any>>(
  options: IDBStorageOptions<T>,
): [
  T,
  (value: T | ((prevState: T) => T)) => Promise<void>,
  () => Promise<void>,
] {
  const {
    key,
    defaultValue,
    database = globalConfig.database,
    store = globalConfig.store,
  } = options;

  const [storedValue, setStoredValue] = React.useState<T>(defaultValue);
  const [db, setDb] = React.useState<IDBDatabase | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const initDB = async () => {
      try {
        const dbInstance = await openDB(database, store);
        if (isMounted) {
          setDb(dbInstance);
        }
      } catch (error) {
        console.error('Failed to open IndexedDB:', error);
      }
    };

    initDB();

    return () => {
      isMounted = false;
    };
  }, [database, store]);

  React.useEffect(() => {
    if (!db) return;

    const loadValue = async () => {
      try {
        const value = await getFromDB<T>(db, store, key);
        if (value !== undefined) {
          setStoredValue(value);
        }
      } catch (error) {
        console.error('Failed to load value from IndexedDB:', error);
      }
    };

    loadValue();
  }, [db, store, key]);

  const updateStoredValue = React.useCallback(
    async (valueOrFn: T | ((prevState: T) => T)) => {
      if (!db) return;

      const newValue =
        typeof valueOrFn === 'function'
          ? (valueOrFn as (prevState: T) => T)(storedValue)
          : valueOrFn;

      setStoredValue(newValue);

      try {
        await setInDB(db, store, key, newValue);
      } catch (error) {
        console.error('Failed to save value to IndexedDB:', error);
      }
    },
    [db, store, key, storedValue],
  );

  const removeStoredValue = React.useCallback(async () => {
    if (!db) return;

    setStoredValue(defaultValue);

    try {
      await removeFromDB(db, store, key);
    } catch (error) {
      console.error('Failed to remove value from IndexedDB:', error);
    }
  }, [db, store, key, defaultValue]);

  return [storedValue, updateStoredValue, removeStoredValue];
}
