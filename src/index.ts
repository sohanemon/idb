import { IDBStorage } from './idb-storage';

// Main exports
export { IDBStorage, IDBStore } from './idb-storage';
export { useIDBStorage } from './hook';
export { IDBConfig } from './idb-context';
export { configureIDBStorage, getGlobalConfig } from './config';

// Convenience instance
export const idb = new IDBStorage();

// Types
export type {
  IDBConfigValues,
  IDBStorageOptions,
  IDBConfigProps,
  UseIDBStorageReturn,
} from './types';
