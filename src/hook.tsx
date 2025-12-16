'use client';

import * as React from 'react';
import { isIDBAvailable } from './database';
import { useIDBConfig } from './idb-context';
import { IDBStorage, type IDBStore } from './idb-storage';
import { idbReducer } from './reducer';
import type { IDBStorageOptions, UseIDBStorageReturn } from './types';

/**
 * Hook to persist state in IndexedDB with a clean object-based API.
 * Optimized for performance - synchronous updates like useState with background IDB persistence.
 *
 * @param options - Configuration object containing key, defaultValue, and optional database/store names
 * @returns An object that supports both tuple and object destructuring:
 *   - Tuple: const [value, setValue, removeValue] = useIDBStorage()
 *   - Object: const { data, update, reset, loading, persisted, error, lastUpdated, refresh } = useIDBStorage()
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
 * // Tuple destructuring (like useState)
 * const [userData, setUserData, removeUserData] = useIDBStorage({
 *   key: 'currentUser',
 *   defaultValue: { name: '', email: '' },
 *   // database: 'myApp', // optional, uses context or global default
 *   // version: 2, // optional, uses context or global default (increment for upgrades)
 *   // store: 'users' // optional, uses context or global default
 * });
 *
 * // Object destructuring (with powerful features)
 * const {
 *   data: userData,
 *   update: updateUserData,
 *   reset: resetUserData,
 *   loading,
 *   persisted,
 *   error,
 *   lastUpdated,
 *   refresh
 * } = useIDBStorage({
 *   key: 'currentUser',
 *   defaultValue: { name: '', email: '' },
 * });
 *
 * // Use powerful features
 * if (error) console.error('Storage error:', error);
 * await refresh(); // Force reload from IndexedDB
 * updateUserData({ name: 'John', email: 'john@example.com' }); // Direct update
 * updateUserData(prev => ({ ...prev, lastLogin: new Date() })); // Functional update
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
  const contextConfig = useIDBConfig();

  const database = opts.database || contextConfig.database;
  const version = Math.max(
    1,
    Math.floor(opts.version || contextConfig.version || 1),
  );
  const store = opts.store || contextConfig.store;

  const [state, dispatch] = React.useReducer(idbReducer, {
    value: defaultValue,
    error: null,
    lastUpdated: null,
  });

  const isInitializedRef = React.useRef(false);
  const storageRef = React.useRef<IDBStorage | null>(null);
  const storeRef = React.useRef<IDBStore | null>(null);

  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const pendingValueRef = React.useRef<T | null>(null);
  const hasLoadedRef = React.useRef(false);
  const initialValueRef = React.useRef<T | null>(null);
  const isFromIDBRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const loadInitialValue = async () => {
      try {
        if (!isIDBAvailable()) {
          console.warn('IndexedDB is not available, using default values only');
          initialValueRef.current = defaultValue;
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
        if (isMounted) {
          isFromIDBRef.current = true;
          dispatch({
            type: 'LOAD_VALUE',
            value: value !== undefined ? value : defaultValue,
          });
          initialValueRef.current = value !== undefined ? value : defaultValue;
        }

        isInitializedRef.current = true;
        hasLoadedRef.current = true;
      } catch (err) {
        console.info('⚡[useIDBStorage] error:', err);
        dispatch({
          type: 'SET_ERROR',
          error: err instanceof Error ? err : new Error(String(err)),
        });
        initialValueRef.current = defaultValue;
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
  }, [database, version, store, key]);

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
          storeRef.current
            .set(key, valueToSave)
            .then(() => {
              initialValueRef.current = valueToSave;
            })
            .catch((err) => {
              console.error('Failed to save value to IndexedDB:', err);
              dispatch({
                type: 'SET_ERROR',
                error: err instanceof Error ? err : new Error(String(err)),
              });
            });
        }
      }, 0); // Use 0 for next tick, or 50-100 for more aggressive batching
    },
    [key],
  );

  // Save to IDB when value changes (after renders)
  React.useEffect(() => {
    if (
      !isInitializedRef.current ||
      !hasLoadedRef.current ||
      isFromIDBRef.current
    ) {
      isFromIDBRef.current = false;
      return;
    }

    saveToIDB(state.value);
  }, [state.value, saveToIDB]);

  const updateStoredValue = React.useCallback(
    (valueOrFn: T | ((prevState: T) => T)) => {
      const newValue =
        typeof valueOrFn === 'function'
          ? (valueOrFn as (prevState: T) => T)(state.value)
          : valueOrFn;

      dispatch({ type: 'UPDATE_VALUE', value: newValue });
    },
    [state.value],
  );

  const removeStoredValue = React.useCallback(() => {
    dispatch({ type: 'RESET', defaultValue });
    initialValueRef.current = defaultValue;
  }, [defaultValue]);

  const refresh = React.useCallback(async () => {
    if (!isIDBAvailable() || !storeRef.current) return;

    try {
      const value = await storeRef.current.get<T>(key);
      isFromIDBRef.current = true;
      dispatch({
        type: 'REFRESH_SUCCESS',
        value: value !== undefined ? value : defaultValue,
      });
      initialValueRef.current = value !== undefined ? value : defaultValue;
    } catch (err) {
      dispatch({
        type: 'REFRESH_ERROR',
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [key, defaultValue]);

  const reset = React.useCallback(() => {
    removeStoredValue();
  }, [removeStoredValue]);

  const update = React.useCallback(
    (valueOrFn: T | ((prevState: T) => T)) => {
      updateStoredValue(valueOrFn);
    },
    [updateStoredValue],
  );

  return Object.assign(
    {
      0: state.value,
      1: updateStoredValue,
      2: removeStoredValue,
      data: state.value,
      update,
      reset,
      loading: !hasLoadedRef.current,
      persisted: hasLoadedRef.current,
      error: state.error,
      lastUpdated: state.lastUpdated,
      refresh,
      length: 3 as const,
    },
    {
      [Symbol.iterator]: function* () {
        yield state.value;
        yield updateStoredValue;
        yield removeStoredValue;
      },
    },
  );
}
