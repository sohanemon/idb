export { configureIDBStorage } from './config';
export { useIDBStorage } from './hook';
export { IDBConfig } from './IDBConfig';

import { IDBStorage } from './IDBStorage';

export { IDBStorage, IDBStore } from './IDBStorage';

export const idb = new IDBStorage();
