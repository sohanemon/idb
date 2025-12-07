/**
 * Database and store configuration values.
 */
export interface IDBConfigValues {
  /** The name of the IndexedDB database */
  database: string;
  /** The version of the IndexedDB database */
  version: number;
  /** The name of the object store */
  store: string;
}

/**
 * Configuration options for IDBStorage.
 */
export interface IDBStorageOptions<T> {
  /** The key for the stored value */
  key: string;
  /** The default value if no value is found in IndexedDB */
  defaultValue: T;
  /** The name of the IndexedDB database (optional, defaults to context or global config) */
  database?: IDBConfigValues['database'];
  /** The version of the IndexedDB database (optional, defaults to context or global config) */
  version?: IDBConfigValues['version'];
  /** The name of the object store (optional, defaults to context or global config) */
  store?: IDBConfigValues['store'];
}

/**
 * Props for the IDBConfig component.
 */
export interface IDBConfigProps extends IDBConfigValues {
  /** The children to render */
  children: React.ReactNode;
}
