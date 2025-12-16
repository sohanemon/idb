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
 * Supports both tuple destructuring: const [value, setValue, removeValue] = useIDBStorage()
 * and object destructuring: const { value, update, reset, loading, persisted, ... } = useIDBStorage()
 */
export type UseIDBStorageReturn<T> = {
  /** The current stored value */
  0: T;
  /** Function to update the stored value */
  1: (value: T | ((prevState: T) => T)) => void;
  /** Function to remove the stored value and reset to default */
  2: () => void;
  /** The current stored data (alias for index 0) */
  data: T;
  /** Function to update the stored value (alias for index 1) */
  update: (value: T | ((prevState: T) => T)) => void;
  /** Function to remove the stored value and reset to default (alias for index 2) */
  reset: () => void;
  /** Whether the hook is still loading initial value from IndexedDB */
  loading: boolean;
  /** Whether the current value has been loaded/persisted to IndexedDB */
  persisted: boolean;
  /** Error that occurred during loading/persistence, if any */
  error: Error | null;
  /** Timestamp of last successful persistence */
  lastUpdated: Date | null;
  /** Force refresh value from IndexedDB */
  refresh: () => Promise<void>;
  /** Length for array-like behavior */
  length: 3;
  /** Iterator for array destructuring */
  [Symbol.iterator](): Iterator<
    T | ((value: T | ((prevState: T) => T)) => void) | (() => void)
  >;
};
