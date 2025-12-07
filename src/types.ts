/**
 * Configuration options for IDBStorage.
 */
export interface IDBStorageOptions<T> {
  /** The key for the stored value */
  key: string;
  /** The default value if no value is found in IndexedDB */
  defaultValue: T;
  /** The name of the IndexedDB database (optional, defaults to global config) */
  database?: string;
  /** The name of the object store (optional, defaults to global config) */
  store?: string;
}
