import type { IDBConfigValues } from './types';

/**
 * Global configuration for IDBStorage defaults.
 */
let globalConfig: IDBConfigValues = {
  database: 'sohanemon-idb',
  version: 1,
  store: 'default',
};

/**
 * Configure global defaults for IDBStorage.
 */
export function configureIDBStorage(config: Partial<IDBConfigValues>) {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get the current global configuration.
 */
export function getGlobalConfig(): IDBConfigValues {
  return { ...globalConfig };
}
