export { configureIDBStorage } from './config';
export { useIDBStorage } from './hook';
export { IDBConfig } from './idb-context';

import { IDBStorage } from './idb-storage';

export { IDBStorage, IDBStore } from './idb-storage';

export const idb = new IDBStorage();
