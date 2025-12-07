/**
 * Configuration options for IDBStorage.
 */
export interface IDBStorageOptions<T> {
  /** The key for the stored value */
  key: string;
  /** The default value if no value is found in IndexedDB */
  defaultValue: T;
  /** The name of the IndexedDB database (optional, defaults to context or global config) */
  database?: string;
  /** The name of the object store (optional, defaults to context or global config) */
  store?: string;
}

/**
 * Props for the IDBConfig component.
 */
export interface IDBConfigProps {
  /** The name of the IndexedDB database */
  database: string;
  /** The name of the object store */
  store: string;
  /** The children to render */
  children: React.ReactNode;
}
