import { renderHook, act } from '@testing-library/react';
import { bench, describe } from 'vitest';
import { useState } from 'react';
import { useIDBStorage } from '../src';

describe('useState vs useIDBStorage Performance', () => {
  bench('useState - synchronous state updates (1000 operations)', () => {
    const { result } = renderHook(() => useState(0));
    const [, setValue] = result.current;

    for (let i = 0; i < 1000; i++) {
      act(() => setValue(i));
    }
  });

  bench('useIDBStorage - async state updates (100 operations)', async () => {
    const { result } = renderHook(() =>
      useIDBStorage({
        key: 'bench-test',
        defaultValue: 0,
      }),
    );

    // Wait for hook to initialize
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const [, setValue] = result.current;

    for (let i = 0; i < 100; i++) {
      await act(async () => {
        await setValue(i);
      });
    }
  });

  bench('useState - functional updates (1000 operations)', () => {
    const { result } = renderHook(() => useState(0));
    const [, setValue] = result.current;

    for (let i = 0; i < 1000; i++) {
      act(() => setValue((prev) => prev + 1));
    }
  });

  bench('useIDBStorage - functional updates (100 operations)', async () => {
    const { result } = renderHook(() =>
      useIDBStorage({
        key: 'bench-functional',
        defaultValue: 0,
      }),
    );

    // Wait for hook to initialize
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const [, setValue] = result.current;

    for (let i = 0; i < 100; i++) {
      await act(async () => {
        await setValue((prev) => prev + 1);
      });
    }
  });

  bench('useState - complex object updates (100 operations)', () => {
    const { result } = renderHook(() =>
      useState({ counter: 0, data: [] as number[] }),
    );
    const [, setValue] = result.current;

    for (let i = 0; i < 100; i++) {
      act(() =>
        setValue((prev) => ({
          counter: prev.counter + 1,
          data: [...prev.data, i],
        })),
      );
    }
  });

  bench('useIDBStorage - complex object updates (50 operations)', async () => {
    const { result } = renderHook(() =>
      useIDBStorage({
        key: 'bench-complex',
        defaultValue: { counter: 0, data: [] as number[] },
      }),
    );

    // Wait for hook to initialize
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const [, setValue] = result.current;

    for (let i = 0; i < 50; i++) {
      await act(async () => {
        await setValue((prev) => ({
          counter: prev.counter + 1,
          data: [...prev.data, i],
        }));
      });
    }
  });

  bench('useState - array push operations (500 operations)', () => {
    const { result } = renderHook(() => useState<number[]>([]));
    const [, setValue] = result.current;

    for (let i = 0; i < 500; i++) {
      act(() => setValue((prev) => [...prev, i]));
    }
  });

  bench('useIDBStorage - array push operations (50 operations)', async () => {
    const { result } = renderHook(() =>
      useIDBStorage({
        key: 'bench-array',
        defaultValue: [] as number[],
      }),
    );

    // Wait for hook to initialize
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const [, setValue] = result.current;

    for (let i = 0; i < 50; i++) {
      await act(async () => {
        await setValue((prev) => [...prev, i]);
      });
    }
  });
});
