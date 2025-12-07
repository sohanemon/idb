import * as React from 'react';
import { getGlobalConfig } from './config';
import { openDB, getFromDB, setInDB, removeFromDB } from './database';
import type { IDBStorageOptions } from './types';

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
export function useIDBStorage<T>(
  options: IDBStorageOptions<T>,
): [
  T,
  (value: T | ((prevState: T) => T)) => Promise<void>,
  () => Promise<void>,
] {
  const {
    key,
    defaultValue,
    database = getGlobalConfig().database,
    store = getGlobalConfig().store,
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
