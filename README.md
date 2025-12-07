# sohanemon/idb

![npm version](https://img.shields.io/npm/v/use-idb-storage)
![npm downloads](https://img.shields.io/npm/dm/use-idb-storage)
![License](https://img.shields.io/npm/l/use-idb-storage)
![Tests](https://github.com/sohanemon/idb/actions/workflows/test.yml/badge.svg)

A modern, developer-friendly IndexedDB library for React and vanilla JavaScript with both hook-based and class-based APIs.

## Features

- 🚀 **Simple API**: Easy-to-use hooks and classes
- 🔄 **Reactive**: React hooks with automatic re-renders
- 🏪 **Multi-store**: Support for multiple object stores
- 📦 **Batch operations**: Efficient bulk operations
- 🔧 **TypeScript**: Full type safety
- 🎯 **Promise-based**: Modern async/await support

## Installation

```bash
npm install use-idb-storage
```

## Quick Start

### Default Instance (Simplest)

```typescript
import { idb } from 'use-idb-storage';

// Use default store immediately
await idb.store.set('user', { name: 'John' });
const user = await idb.store.get('user');

// Use custom store
const customStore = await idb.get('settings');
await customStore.set('theme', 'dark');
```

### React Hook (Recommended for React apps)

```tsx
import { useIDBStorage, IDBConfig } from 'use-idb-storage';

function App() {
  return (
    <IDBConfig database="my-app" version={1} store="data">
      <MyComponent />
    </IDBConfig>
  );
}

function MyComponent() {
  const [user, setUser, removeUser] = useIDBStorage({
    key: 'current-user',
    defaultValue: { name: '', email: '' }
  });

  return (
    <div>
      <input
        value={user.name}
        onChange={e => setUser({ ...user, name: e.target.value })}
      />
      <button onClick={() => removeUser()}>Clear</button>
    </div>
  );
}
```

### Class-based API (For advanced use cases)

```tsx
import { IDBStorage } from 'use-idb-storage';

// Create storage instance
const db = new IDBStorage({
  database: 'my-app',
  version: 1,
  store: 'data'
});

// Get a store
const store = await db.get('my-store');
// Or use default store
const defaultStore = await db.store; // Convenience getter

// Basic operations
await store.set('user', { name: 'John', age: 30 });
const user = await store.get('user');
await store.delete('user');

// Batch operations
await store.setMany([
  ['key1', 'value1'],
  ['key2', 'value2']
]);
const values = await store.getMany(['key1', 'key2']);

// Advanced operations
await store.update('counter', (val) => (val || 0) + 1);
const allKeys = await store.keys();
await store.clear();
```

## API Reference

### Default Instance

```typescript
import { idb } from 'use-idb-storage';
```

A pre-configured `IDBStorage` instance using global defaults. Perfect for quick usage without setup.

- `idb.store: Promise<IDBStore>` - Default store instance
- `idb.get(storeName: string): Promise<IDBStore>` - Get a specific store
- `idb.drop(storeName: string): Promise<void>` - Clear a store
- `idb.close(): void` - Close the database connection

### IDBStorage Class

Main entry point for database operations.

#### Constructor

```typescript
new IDBStorage(config: IDBConfigValues)
```

#### Properties

- `store: Promise<IDBStore>` - Default store instance (convenience getter)

#### Methods

- `get(storeName: string): Promise<IDBStore>` - Get a store instance
- `getStore(): Promise<IDBStore>` - Get the default store instance
- `drop(storeName: string): Promise<void>` - Clear a store (IndexedDB doesn't support dropping stores after creation)
- `close(): void` - Close the database connection

### IDBStore Class

Provides operations for a specific object store.

#### Methods

**Single Operations:**
- `get<T>(key: string): Promise<T | undefined>`
- `set<T>(key: string, value: T): Promise<void>`
- `delete(key: string): Promise<void>`

**Batch Operations:**
- `getMany<T>(keys: string[]): Promise<(T | undefined)[]>`
- `setMany<T>(entries: [string, T][]): Promise<void>`
- `deleteMany(keys: string[]): Promise<void>`

**Utility Operations:**
- `update<T>(key: string, updater: (value: T | undefined) => T): Promise<void>`
- `clear(): Promise<void>`
- `keys(): Promise<string[]>`
- `values<T>(): Promise<T[]>`
- `entries<T>(): Promise<[string, T][]>`

### useIDBStorage Hook

React hook for reactive IndexedDB state management.

```typescript
const [value, setValue, removeValue] = useIDBStorage(options);
```

#### Parameters

```typescript
interface IDBStorageOptions<T> {
  key: string;
  defaultValue: T;
  database?: string;
  version?: number;
  store?: string;
}
```

#### Returns

- `value: T` - Current stored value
- `setValue: (value: T | ((prev: T) => T)) => Promise<void>` - Update function
- `removeValue: () => Promise<void>` - Remove function

### IDBConfig Provider

React context provider for default configuration.

```tsx
<IDBConfig database="my-app" version={1} store="data">
  <App />
</IDBConfig>
```

### Configuration

```typescript
interface IDBConfigValues {
  database: string;    // IndexedDB database name
  version?: number;    // Database version (default: 1)
  store: string;       // Default object store name
}
```

## Advanced Usage

### Custom Stores

```typescript
const db = new IDBStorage({ database: 'my-app', store: 'default' });

// Different stores for different data types
const users = await db.get('users');
const settings = await db.get('settings');

await users.set('user-1', { name: 'John' });
await settings.set('theme', 'dark');
```

### Batch Operations

```typescript
const store = await db.getStore();

// Set multiple values
await store.setMany([
  ['user1', { name: 'Alice' }],
  ['user2', { name: 'Bob' }],
  ['user3', { name: 'Charlie' }]
]);

// Get multiple values
const users = await store.getMany(['user1', 'user2']);
```

### Reactive Updates

```typescript
const [counter, setCounter] = useIDBStorage({
  key: 'clicks',
  defaultValue: 0
});

// This will automatically persist to IndexedDB
const increment = () => setCounter(count => count + 1);
```

### Migration Strategy

For database migrations, increment the version number:

```typescript
// Version 1
<IDBConfig database="my-app" version={1} store="data">
  <App />
</IDBConfig>

// Version 2 (with new features)
<IDBConfig database="my-app" version={2} store="data">
  <App />
</IDBConfig>
```

## Browser Support

- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

## License

ISC
