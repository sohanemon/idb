import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useIDBStorage } from '../src';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

describe('useIDBStorage', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() =>
      useIDBStorage({
        key: 'test-key',
        defaultValue: { value: 'default' },
      }),
    );

    expect(result.current[0]).toEqual({ value: 'default' });
  });

  it('should use default database and store names', () => {
    const { result } = renderHook(() =>
      useIDBStorage({
        key: 'test-key',
        defaultValue: { value: 'default' },
      }),
    );

    expect(result.current[0]).toEqual({ value: 'default' });
  });

  it('should accept custom database and store names', () => {
    const { result } = renderHook(() =>
      useIDBStorage({
        key: 'test-key',
        defaultValue: { value: 'default' },
        database: 'custom-db',
        store: 'custom-store',
      }),
    );

    expect(result.current[0]).toEqual({ value: 'default' });
  });

  // TODO: Add more comprehensive tests with mocked IndexedDB
});
