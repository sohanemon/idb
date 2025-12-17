import { IDBStorage } from './idb-storage';

export { configureIDBStorage, getGlobalConfig } from './config';
export { useIDBStorage } from './hook';
export { IDBConfig } from './idb-config';
// Main exports
export { IDBStorage, IDBStore } from './idb-storage';

// Convenience instance
export const idb = new IDBStorage();

// Types
export type {
  IDBConfigValues,
  IDBStorageOptions,
  UseIDBStorageReturn,
} from './types';
