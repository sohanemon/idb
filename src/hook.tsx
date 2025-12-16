'use client';

import * as React from 'react';
import { isIDBAvailable } from './database';
import { useIDBConfig } from './idb-context';
import { IDBStorage, type IDBStore } from './idb-storage';
import type { IDBStorageOptions, UseIDBStorageReturn } from './types';

/**
 * Hook to persist state in IndexedDB with a clean object-based API.
 * Optimized for performance - synchronous updates like useState with background IDB persistence.
 */
export function useIDBStorage<T>(
  options: IDBStorageOptions<T>,
): UseIDBStorageReturn<T> {
  const { key, defaultValue, ...opts } = options;
  const contextConfig = useIDBConfig();

  const database = opts.database || contextConfig.database;
  const version = Math.max(
    1,
    Math.floor(opts.version || contextConfig.version || 1),
  );
  const store = opts.store || contextConfig.store;

  const [storedValue, setStoredValue] = React.useState<T>(defaultValue);

  const isInitializedRef = React.useRef(false);
  const storageRef = React.useRef<IDBStorage | null>(null);
  const storeRef = React.useRef<IDBStore | null>(null);

  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const pendingValueRef = React.useRef<T | null>(null);
  const hasLoadedRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const loadInitialValue = async () => {
      try {
        if (!isIDBAvailable()) {
          console.warn('IndexedDB is not available, using default values only');
          isInitializedRef.current = true;
          hasLoadedRef.current = true;
          return;
        }

        if (storageRef.current) {
          storageRef.current.close();
        }

        const storage = new IDBStorage({ database, version, store });
        const storeInstance = await storage.get(store);

        if (!isMounted) return;

        storageRef.current = storage;
        storeRef.current = storeInstance;

        const value = await storeInstance.get<T>(key);
        if (isMounted && value !== undefined) {
          setStoredValue(value);
        }

        isInitializedRef.current = true;
        hasLoadedRef.current = true;
      } catch (err) {
        console.error('Failed to initialize IDBStorage:', err);
        isInitializedRef.current = true;
        hasLoadedRef.current = true;
      }
    };

    loadInitialValue();

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Flush pending save immediately
        if (pendingValueRef.current !== null && storeRef.current) {
          storeRef.current
            .set(key, pendingValueRef.current)
            .catch(console.error);
        }
      }
      if (storageRef.current) {
        storageRef.current.close();
        storageRef.current = null;
        storeRef.current = null;
      }
    };
  }, [database, version, store, key]); // Use primitive values as dependencies

  const saveToIDB = React.useCallback(
    (value: T) => {
      // Don't save if not initialized or no store available
      if (
        !isInitializedRef.current ||
        !storeRef.current ||
        !hasLoadedRef.current
      ) {
        return;
      }

      // Store the pending value
      pendingValueRef.current = value;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const valueToSave = pendingValueRef.current;
        pendingValueRef.current = null;

        if (valueToSave !== null && storeRef.current) {
          storeRef.current.set(key, valueToSave).catch((err) => {
            console.error('Failed to save value to IndexedDB:', err);
          });
        }
      }, 0); // Use 0 for next tick, or 50-100 for more aggressive batching
    },
    [key],
  );

  const updateStoredValue = React.useCallback(
    (valueOrFn: T | ((prevState: T) => T)) => {
      setStoredValue((prev) => {
        const newValue =
          typeof valueOrFn === 'function'
            ? (valueOrFn as (prevState: T) => T)(prev)
            : valueOrFn;

        saveToIDB(newValue);

        return newValue;
      });
    },
    [saveToIDB],
  );

  const removeStoredValue = React.useCallback(() => {
    setStoredValue(defaultValue);
    saveToIDB(defaultValue);
  }, [defaultValue, saveToIDB]);

  return [storedValue, updateStoredValue, removeStoredValue];
}
