'use client';

import * as React from 'react';
import { getGlobalConfig } from './config';
import type { IDBConfigProps, IDBConfigValues } from './types';

/**
 * Context for IDB configuration
 */
const IDBConfigContext = React.createContext<IDBConfigValues | null>(null);

/**
 * Hook to get the current IDB config from context or global fallback
 */
export function useIDBConfig(): IDBConfigValues {
  const contextConfig = React.useContext(IDBConfigContext);
  return contextConfig || getGlobalConfig();
}

/**
 * Provider component to configure default IDBStorage settings.
 * This passes config to children via context instead of global state.
 *
 * @param props - Configuration props containing database, store, and children
 * @returns The provider component wrapping children
 *
 * @example
 * ```tsx
 * <IDBConfig database="myApp" store="data">
 *   <App />
 * </IDBConfig>
 * ```
 */
export function IDBConfig({ children, ...conf }: IDBConfigProps) {
  const config: IDBConfigValues = {
    database: conf.database || 'sohanemon-idb',
    version: conf.version || 1,
    store: conf.store || 'default',
  };

  return (
    <IDBConfigContext.Provider value={config}>
      {children}
    </IDBConfigContext.Provider>
  );
}
