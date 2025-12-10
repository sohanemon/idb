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
export interface IDBStorageOptions<T> extends Partial<IDBConfigValues> {
  /** The key for the stored value */
  key: string;
  /** The default value if no value is found in IndexedDB */
  defaultValue: T;
}

/**
 * Props for the IDBConfig component.
 */
export interface IDBConfigProps extends Partial<IDBConfigValues> {
  /** The children to render */
  children: React.ReactNode;
}

/**
 * Return type of the useIDBStorage hook
 */
export type UseIDBStorageReturn<T> = [
  T,
  (value: T | ((prevState: T) => T)) => Promise<void>,
  () => Promise<void>,
];
