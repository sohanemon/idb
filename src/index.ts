import { IDBStorage } from './idb-storage';

export { configureIDBStorage, getGlobalConfig } from './config';
export { useIDBStorage } from './hook';
export { IDBConfig, useIDBConfig } from './idb-context';
// Main exports
export { IDBStorage, IDBStore } from './idb-storage';

// Convenience instance
export const idb = new IDBStorage();

// Types
export type {
  IDBConfigProps,
  IDBConfigValues,
  IDBStorageOptions,
  UseIDBStorageReturn,
} from './types';
