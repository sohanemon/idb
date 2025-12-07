import * as React from 'react';
import { configureIDBStorage } from './config';
import type { IDBConfigProps } from './types';

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
  // Update global config when provider is used
  React.useEffect(() => {
    configureIDBStorage(conf);
  }, [conf]);

  return children;
}
