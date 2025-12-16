# Performance Testing Guide

This guide explains how to test the performance of `useIDBStorage` compared to React's `useState`.

## Overview

The performance test measures commit-visible time (renders + scheduler) for forced unbatched updates, not setter enqueue cost. This provides a realistic comparison of the overhead introduced by IndexedDB persistence.

## Test Component

Add the following component to your React app to run performance tests:

```tsx
import { useState, useRef, useLayoutEffect } from 'react';
import { useIDBStorage } from 'use-idb-storage';

function useCommitTimer() {
  const start = useRef<number | null>(null);
  const renders = useRef(0);

  renders.current++;

  useLayoutEffect(() => {
    if (start.current !== null) {
      performance.mark('commit');
    }
  });

  return {
    begin() {
      renders.current = 0;
      start.current = performance.now();
      performance.clearMarks();
    },
    end() {
      return {
        renders: renders.current,
        time: performance.now() - (start.current ?? 0),
      };
    },
  };
}

async function runForcedUpdates(
  updates: number,
  setFn: React.Dispatch<React.SetStateAction<number>>,
) {
  for (let i = 0; i < updates; i++) {
    await new Promise(requestAnimationFrame);
    setFn((v) => v + 1);
  }
}

export function PerformanceTest() {
  const [useStateCount, setUseStateCount] = useState(0);
  const [useIDBCount, setUseIDBCount] = useIDBStorage({
    key: 'perf-test-count',
    defaultValue: 0,
  });

  const stateTimer = useCommitTimer();
  const idbTimer = useCommitTimer();

  const [stateResult, setStateResult] = useState<any>(null);
  const [idbResult, setIdbResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const UPDATES = 200;

  const testUseState = async () => {
    setRunning(true);
    stateTimer.begin();
    await runForcedUpdates(UPDATES, setUseStateCount);
    setStateResult(stateTimer.end());
    setRunning(false);
  };

  const testUseIDBStorage = async () => {
    setRunning(true);
    idbTimer.begin();
    await runForcedUpdates(UPDATES, setUseIDBCount);
    setIdbResult(idbTimer.end());
    setRunning(false);
  };

  const resetCounters = () => {
    setUseStateCount(0);
    setUseIDBCount(0);
    setStateResult(null);
    setIdbResult(null);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 15 }}>
      <h3>Legit Performance: useState vs useIDBStorage</h3>
      <p>
        Forced unbatched updates. Measures commit-visible time (renders +
        scheduler), not setter enqueue cost.
      </p>
      <div>
        <strong>useState:</strong> {useStateCount}
        {stateResult && (
          <span>
            {' '}
            — {stateResult.time.toFixed(2)}ms ({stateResult.renders} renders)
          </span>
        )}
      </div>
      <div>
        <strong>useIDBStorage:</strong> {useIDBCount}
        {idbResult && (
          <span>
            {' '}
            — {idbResult.time.toFixed(2)}ms ({idbResult.renders} renders)
          </span>
        )}
      </div>
      <br />
      <button onClick={testUseState} disabled={running}>
        Test useState ({UPDATES} updates)
      </button>{' '}
      <button onClick={testUseIDBStorage} disabled={running}>
        Test useIDBStorage ({UPDATES} updates)
      </button>{' '}
      <button onClick={resetCounters} disabled={running}>
        Reset
      </button>
      {stateResult && idbResult && (
        <pre style={{ marginTop: 12, background: '#000', color: '#0f0' }}>
          {JSON.stringify(
            {
              useState: stateResult,
              useIDBStorage: idbResult,
              differenceMs: Math.abs(stateResult.time - idbResult.time),
            },
            null,
            2,
          )}
        </pre>
      )}
    </div>
  );
}
```

## How to Use

1. Import the `PerformanceTest` component into your app
2. Render it in your component tree
3. Click "Test useState" to benchmark React's built-in state
4. Click "Test useIDBStorage" to benchmark IndexedDB-backed state
5. Compare the results in the JSON output

## Expected Results

You should see minimal performance difference between `useState` and `useIDBStorage`, demonstrating that the IndexedDB persistence layer adds negligible overhead while providing durable storage.

## Notes

- Tests use forced unbatched updates to simulate worst-case scenarios
- Performance measurements include React's rendering and commit phases
- Results may vary slightly between browsers and devices