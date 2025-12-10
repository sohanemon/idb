import * as React from 'react';
import { getGlobalConfig } from './config';
import { isIDBAvailable } from './database';
import { IDBStorage, IDBStore } from './idb-storage';
import type { IDBStorageOptions, UseIDBStorageReturn } from './types';

/**
 * Hook to persist state in IndexedDB with a clean object-based API.
 *
 * @param options - Configuration object containing key, defaultValue, and optional database/store names
 * @returns A tuple of the stored value, an async updater function, and a remove function.
 *
 * @example
 * ```tsx
 * // Option 1: Using the provider (recommended)
 * <IDBConfig database="myApp" store="data">
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
): UseIDBStorageReturn<T> {
  const { key, defaultValue, ...opts } = options;
  const globalConfig = getGlobalConfig();
  const config = { ...globalConfig, ...opts };

  // Ensure version is valid (must be positive integer)
  config.version = Math.max(1, Math.floor(config.version || 1));

  const [storedValue, setStoredValue] = React.useState<T>(defaultValue);
  const [error, setError] = React.useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const storageRef = React.useRef<IDBStorage | null>(null);
  const storeRef = React.useRef<IDBStore | null>(null);
  const pendingUpdatesRef = React.useRef<Array<() => Promise<void>>>([]);

  // Load initial value
  React.useEffect(() => {
    let isMounted = true;

    const loadInitialValue = async () => {
      try {
        if (!isIDBAvailable()) {
          console.warn('IndexedDB is not available, using default values only');
          return;
        }

        setError(null);

        // Close existing storage connection if config changed
        if (storageRef.current) {
          storageRef.current.close();
          storageRef.current = null;
          storeRef.current = null;
        }

        const storage = new IDBStorage(config);
        const store = await storage.get(config.store);

        if (!isMounted) return;

        storageRef.current = storage;
        storeRef.current = store;

        // Load the initial value
        const value = await store.get<T>(key);
        if (isMounted && value !== undefined) {
          setStoredValue(value);
        }

        // Mark as initialized and process any pending updates
        if (isMounted) {
          setIsInitialized(true);
          // Process pending updates
          const pendingUpdates = pendingUpdatesRef.current;
          pendingUpdatesRef.current = [];
          for (const update of pendingUpdates) {
            update().catch((err) => {
              console.error('Failed to process pending update:', err);
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to load from IndexedDB'),
          );
          console.error('Failed to initialize IDBStorage:', err);
        }
      }
    };

    loadInitialValue();

    return () => {
      isMounted = false;
      // Close storage connection on cleanup
      if (storageRef.current) {
        storageRef.current.close();
        storageRef.current = null;
        storeRef.current = null;
      }
    };
  }, [config.database, config.version, config.store, key]);

  const updateStoredValue = React.useCallback(
    async (valueOrFn: T | ((prevState: T) => T)) => {
      if (error) {
        console.warn('Cannot update value due to previous error:', error);
        return;
      }

      const newValue =
        typeof valueOrFn === 'function'
          ? (valueOrFn as (prevState: T) => T)(storedValue)
          : valueOrFn;

      // Update local state immediately for better UX
      setStoredValue(newValue);

      // Save to IndexedDB
      const saveToIDB = async () => {
        if (storeRef.current) {
          await storeRef.current.set(key, newValue);
        } else {
          throw new Error('Store not initialized');
        }
      };

      if (isInitialized) {
        try {
          await saveToIDB();
        } catch (err) {
          // Revert local state on error
          setStoredValue(storedValue);
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to save to IndexedDB'),
          );
          console.error('Failed to save value to IndexedDB:', err);
          throw err;
        }
      } else {
        // Queue the update for when initialization completes
        pendingUpdatesRef.current.push(saveToIDB);
      }
    },
    [storedValue, key, error, isInitialized],
  );

  const removeStoredValue = React.useCallback(async () => {
    if (error) {
      console.warn('Cannot remove value due to previous error:', error);
      return;
    }

    // Update local state immediately
    setStoredValue(defaultValue);

    // Remove from IndexedDB
    const removeFromIDB = async () => {
      if (storeRef.current) {
        await storeRef.current.delete(key);
      } else {
        throw new Error('Store not initialized');
      }
    };

    if (isInitialized) {
      try {
        await removeFromIDB();
      } catch (err) {
        // Revert local state on error
        setStoredValue(storedValue);
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to remove from IndexedDB'),
        );
        console.error('Failed to remove value from IndexedDB:', err);
        throw err;
      }
    } else {
      // Queue the removal for when initialization completes
      pendingUpdatesRef.current.push(removeFromIDB);
    }
  }, [storedValue, key, defaultValue, error, isInitialized]);

  return [storedValue, updateStoredValue, removeStoredValue];
}
