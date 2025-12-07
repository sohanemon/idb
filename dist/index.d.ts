//#region src/config.d.ts
/**
 * Configure global defaults for IDBStorage.
 */
declare function configureIDBStorage(config: {
  database?: string;
  store?: string;
}): void;
//#endregion
//#region src/types.d.ts
/**
 * Configuration options for IDBStorage.
 */
interface IDBStorageOptions<T> {
  /** The key for the stored value */
  key: string;
  /** The default value if no value is found in IndexedDB */
  defaultValue: T;
  /** The name of the IndexedDB database (optional, defaults to global config) */
  database?: string;
  /** The name of the object store (optional, defaults to global config) */
  store?: string;
}
//#endregion
//#region src/hook.d.ts
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
declare function useIDBStorage<T>(options: IDBStorageOptions<T>): [T, (value: T | ((prevState: T) => T)) => Promise<void>, () => Promise<void>];
//#endregion
export { configureIDBStorage, useIDBStorage };