/**
 * Global configuration for IDBStorage defaults.
 */
let globalConfig = {
  database: 'sohanemon-idb',
  store: 'default',
};

/**
 * Configure global defaults for IDBStorage.
 */
export function configureIDBStorage(config: {
  database?: string;
  store?: string;
}) {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get the current global configuration.
 */
export function getGlobalConfig() {
  return { ...globalConfig };
}
