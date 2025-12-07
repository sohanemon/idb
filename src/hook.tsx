import * as React from 'react';
import { getGlobalConfig } from './config';
import { getFromDB, openDB, removeFromDB, setInDB } from './database';
import { useIDBContext } from './IDBConfig';
import type { IDBStorageOptions } from './types';

/**
 * Hook to persist state in IndexedDB with a clean object-based API.
 *
 * @param options - Configuration object containing key, defaultValue, and optional database/store names
 * @returns A tuple of the stored value, an async updater function, and a remove function.
 *
 * @example
 * ```tsx
 * // Option 1: Using the provider (recommended)
 * <IDBConfig database="myApp" version={2} store="data">
 *   <App />
 * </IDBConfig>
 *
 * // Option 2: Global config
 * configureIDBStorage({ database: 'myApp', version: 2, store: 'data' });
 *
 * const [userData, setUserData, removeUserData] = useIDBStorage({
 *   key: 'currentUser',
 *   defaultValue: { name: '', email: '' },
 *   // database: 'myApp', // optional, uses context or global default
 *   // version: 2, // optional, uses context or global default (increment for upgrades)
 *   // store: 'users' // optional, uses context or global default
 * });
 *
 * // Update data
 * await setUserData({ name: 'John', email: 'john@example.com' });
 *
 * // Remove data
 * await removeUserData();
 * ```
 *
 * @note The version parameter is used for IndexedDB database versioning.
 * When you increment the version, it triggers database upgrades. You cannot
 * "downgrade" to a lower version once a database exists with a higher version.
 */
export function useIDBStorage<T>(
  options: IDBStorageOptions<T>,
): [
  T,
  (value: T | ((prevState: T) => T)) => Promise<void>,
  () => Promise<void>,
] {
  const context = useIDBContext();
  const globalConfig = getGlobalConfig();
  const {
    key,
    defaultValue,
    database = context?.database ?? globalConfig.database,
    version = context?.version ?? globalConfig.version,
    store = context?.store ?? globalConfig.store,
  } = options;

  // Ensure version is valid (must be positive integer)
  const validVersion = Math.max(1, Math.floor(version || 1));

  const [storedValue, setStoredValue] = React.useState<T>(defaultValue);
  const [db, setDb] = React.useState<IDBDatabase | null>(null);
  const dbRef = React.useRef<IDBDatabase | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const initDB = async () => {
      try {
        // Close existing database connection if it exists
        if (dbRef.current) {
          dbRef.current.close();
          dbRef.current = null;
        }

        const dbInstance = await openDB(database, store, validVersion);
        if (isMounted) {
          dbRef.current = dbInstance;
          setDb(dbInstance);
        }
      } catch (error) {
        console.error('Failed to open IndexedDB:', error);
      }
    };

    initDB();

    return () => {
      isMounted = false;
      // Close database connection on cleanup
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    };
  }, [database, version, store]);

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

  // Cleanup database connection on unmount
  React.useEffect(() => {
    return () => {
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    };
  }, []);

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
