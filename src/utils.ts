import type { IDBConfigValues } from './types';

/**
 * Global configuration for IDBStorage defaults.
 */
let globalIDBConfig: IDBConfigValues = {
  database: 'sohanemon-idb',
  version: 1,
  store: 'default',
};

/**
 * Configure global defaults for IDBStorage.
 */
export function configureIDBStorage(config: Partial<IDBConfigValues>): void {
  globalIDBConfig = { ...globalIDBConfig, ...config };
}

/**
 * Get the current global configuration.
 */
export function getGlobalConfig(): IDBConfigValues {
  return { ...globalIDBConfig };
}
