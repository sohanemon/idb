import * as React from 'react';
import { getGlobalConfig } from './config';
import { IDBStorage, IDBStore } from './idb-storage';
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
  const globalConfig = getGlobalConfig();
  const { key, defaultValue, ...opts } = options;
  const config = { ...globalConfig, ...opts };

  // Ensure version is valid (must be positive integer)

  const [storedValue, setStoredValue] = React.useState<T>(defaultValue);
  const [storeInstance, setStoreInstance] = React.useState<IDBStore | null>(
    null,
  );
  const storageRef = React.useRef<IDBStorage | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const initStorage = async () => {
      try {
        // Close existing storage connection if it exists
        if (storageRef.current) {
          storageRef.current.close();
          storageRef.current = null;
        }

        const storage = IDBStorage.getInstance(config);
        const storeInst = await storage.get(config.store);

        if (isMounted) {
          storageRef.current = storage;
          setStoreInstance(storeInst);

          // Load the initial value
          try {
            const value = await storeInst.get<T>(key);
            if (isMounted && value !== undefined) {
              setStoredValue(value);
            }
          } catch (error) {
            // Only log if it's not an InvalidStateError (which happens when db is closed)
            if (
              !(
                error instanceof DOMException &&
                error.name === 'InvalidStateError'
              )
            ) {
              console.error('Failed to load value from IndexedDB:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize IDBStorage:', error);
      }
    };

    initStorage();

    return () => {
      isMounted = false;
      // Close storage connection on cleanup
      if (storageRef.current) {
        storageRef.current.close();
        storageRef.current = null;
      }
    };
  }, [config, key]);

  const updateStoredValue = React.useCallback(
    async (valueOrFn: T | ((prevState: T) => T)) => {
      const newValue =
        typeof valueOrFn === 'function'
          ? (valueOrFn as (prevState: T) => T)(storedValue)
          : valueOrFn;

      setStoredValue(newValue);

      if (storeInstance) {
        try {
          await storeInstance.set(key, newValue);
        } catch (error) {
          // Only log if it's not an InvalidStateError
          if (
            !(
              error instanceof DOMException &&
              error.name === 'InvalidStateError'
            )
          ) {
            console.error('Failed to save value to IndexedDB:', error);
          }
        }
      }
    },
    [storeInstance, key, storedValue],
  );

  const removeStoredValue = React.useCallback(async () => {
    setStoredValue(defaultValue);

    if (storeInstance) {
      try {
        await storeInstance.delete(key);
      } catch (error) {
        // Only log if it's not an InvalidStateError
        if (
          !(error instanceof DOMException && error.name === 'InvalidStateError')
        ) {
          console.error('Failed to remove value from IndexedDB:', error);
        }
      }
    }
  }, [storeInstance, key, defaultValue]);

  return [storedValue, updateStoredValue, removeStoredValue];
}
