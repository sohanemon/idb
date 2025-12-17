'use client';

import * as React from 'react';
import { configureIDBStorage } from './config';
import type { IDBConfigValues } from './types';

export const IDBConfig = ({
  children,
  ...conf
}: { children: React.ReactNode } & Partial<IDBConfigValues>) => {
  React.useEffect(() => {
    configureIDBStorage(conf);
  }, [conf]);

  return children;
};
