import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Helper to wait for next tick
export const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

// Helper to wait for a specific amount of time
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper to flush all pending promises
export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

// Helper to create a test database name
export const createTestDbName = () => `test-db-${Date.now()}-${Math.random()}`;

// Helper to clear all fake-indexeddb databases
export const clearAllDatabases = async () => {
  if (typeof window !== 'undefined' && window.indexedDB) {
    // Close all connections
    const databases = (await window.indexedDB.databases?.()) || [];
    for (const db of databases) {
      if (db.name?.startsWith('test-db-')) {
        window.indexedDB.deleteDatabase(db.name);
      }
    }
  }
};

// Setup and teardown for each test
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(async () => {
  await clearAllDatabases();
});
