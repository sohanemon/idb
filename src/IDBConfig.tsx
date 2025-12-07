import * as React from 'react';
import type { IDBConfigProps, IDBConfigValues } from './types';

/**
 * Context for IDB configuration.
 */
const IDBContext = React.createContext<IDBConfigValues | null>(null);

/**
 * Provider component to configure default IDBStorage settings.
 * This is optional - if not used, the hook will fall back to global config.
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
  return <IDBContext.Provider value={conf}>{children}</IDBContext.Provider>;
}

/**
 * Hook to access the current IDB context.
 * @returns The current context value or null if no provider is used
 */
export function useIDBContext(): IDBConfigValues | null {
  return React.useContext(IDBContext);
}
