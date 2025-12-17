# useIDBStorage

[![npm](https://img.shields.io/npm/v/use-idb-storage)](https://www.npmjs.com/package/use-idb-storage)
[![npm downloads](https://img.shields.io/npm/dm/use-idb-storage)](https://www.npmjs.com/package/use-idb-storage)
![License](https://img.shields.io/npm/l/use-idb-storage)
![Tests](https://github.com/sohanemon/idb/actions/workflows/test.yml/badge.svg)

A React hook for IndexedDB state management with automatic persistence, similar to `useState` but with data persistence across sessions.

## Performance

Near-native performance with minimal overhead. Benchmark shows only 1.5ms difference vs `useState` for 400 forced updates:

```json
{
  "useState": { "renders": 400, "time": 3317.9 },
  "useIDBStorage": { "renders": 400, "time": 3316.4 },
  "differenceMs": 1.5
}
```

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed benchmarks.

## Installation

```bash
npm install use-idb-storage
```

## Quick Start

### Basic Usage

```tsx
import { useIDBStorage } from 'use-idb-storage';

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
      <p>Data persists across browser sessions.</p>
    </div>
  );
}
```

### Advanced Usage

Use object destructuring for additional features:

```tsx
function AdvancedComponent() {
  const {
    data: user,
    update: setUser,
    reset: clearUser,
    loading,
    persisted,
    error,
    lastUpdated,
    refresh
  } = useIDBStorage({
    key: 'current-user',
    defaultValue: { name: '', email: '', avatar: null }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{user.name || 'Anonymous'}</h2>
      <button onClick={() => setUser(prev => ({
        ...prev,
        loginCount: (prev.loginCount || 0) + 1
      }))}>
        Increment Login Count
      </button>
      <button onClick={() => setUser({ ...user, name: 'John' })}>
        Set Name
      </button>
      <button onClick={clearUser}>Reset</button>
      <button onClick={() => refresh()}>Refresh from DB</button>
      <div>
        Status: {persisted ? 'Saved' : 'Saving...'}
        {lastUpdated && (
          <span>Last saved: {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}
```

### Global Configuration

Configure global defaults that affect all hooks and the exported `idb` instance:

```tsx
import { configureIDBStorage, useIDBStorage, idb } from 'use-idb-storage';

// Set global configuration
configureIDBStorage({
  database: 'my-app',
  version: 1,
  store: 'data'
});

// Hooks automatically use global config
function MyComponent() {
  const [user] = useIDBStorage({
    key: 'current-user',
    defaultValue: { name: '' }
  }); // Uses global config: database="my-app", store="data"

  // Override specific settings
  const [cache] = useIDBStorage({
    key: 'api-cache',
    defaultValue: {},
    store: 'cache' // Overrides global store
  }); // Uses: database="my-app", store="cache"

  return <div>...</div>;
}

// The exported instance also uses global config
async function saveGlobalData() {
  const store = await idb.store; // Uses global config
  await store.set('global-key', 'global-value');
}
```

### Global Configuration (No Context Required)

```tsx
import { configureIDBStorage, idb } from 'use-idb-storage';

// Configure global defaults
configureIDBStorage({
  database: 'my-app',
  version: 1,
  store: 'data'
});

// Use the pre-configured instance
async function saveUser(userData) {
  const store = await idb.store;
  await store.set('current-user', userData);
}

async function getUser() {
  const store = await idb.store;
  return await store.get('current-user');
}
```

### Advanced Usage

Use object destructuring for additional features:

```tsx
function AdvancedComponent() {
  const {
    data: user,
    update: setUser,
    reset: clearUser,
    loading,
    persisted,
    error,
    lastUpdated,
    refresh
  } = useIDBStorage({
    key: 'user-profile',
    defaultValue: { name: '', email: '', avatar: null }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{user.name || 'Anonymous'}</h2>
      <button onClick={() => setUser(prev => ({
        ...prev,
        loginCount: (prev.loginCount || 0) + 1
      }))}>
        Increment Login Count
      </button>
      <button onClick={() => setUser({ ...user, name: 'John' })}>
        Set Name
      </button>
      <button onClick={clearUser}>Reset</button>
      <button onClick={() => refresh()}>Refresh from DB</button>
      <div>
        Status: {persisted ? 'Saved' : 'Saving...'}
        {lastUpdated && (
          <span>Last saved: {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}
```

### Class-based API

```tsx
import { IDBStorage } from 'use-idb-storage';

const db = new IDBStorage({
  database: 'my-app',
  version: 1,
  store: 'data'
});

const store = await db.get('my-store');
const defaultStore = await db.store;

await store.set('user', { name: 'John', age: 30 });
const user = await store.get('user');
await store.delete('user');

await store.setMany([
  ['key1', 'value1'],
  ['key2', 'value2']
]);
const values = await store.getMany(['key1', 'key2']);

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

#### Global Configuration

Configure global defaults that affect the default `idb` instance:

```typescript
import { configureIDBStorage, idb } from 'use-idb-storage';

// Set global configuration
configureIDBStorage({
  database: 'my-app',
  version: 1,
  store: 'data'
});

// Now idb.store refers to the 'data' store in 'my-app' database
const store = await idb.store;
await store.set('user', { name: 'John' });
```

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

Supports both simple `useState`-style usage and advanced object destructuring.

#### Basic Usage

```tsx
const [value, setValue, removeValue] = useIDBStorage({
  key: 'my-key',
  defaultValue: 'default value'
});

setValue('new value');
setValue(prev => prev + ' updated');
removeValue();
```

#### Advanced Usage

```tsx
const {
  data,
  update,
  reset,
  loading,
  persisted,
  error,
  lastUpdated,
  refresh
} = useIDBStorage({
  key: 'my-key',
  defaultValue: 'default value'
});
```

#### Parameters

```typescript
interface IDBStorageOptions<T> {
  key: string;              // Unique key for the stored value
  defaultValue: T;          // Default value if none exists in IndexedDB
  database?: string;        // Database name (uses context default)
  version?: number;         // Database version (uses context default)
  store?: string;           // Object store name (uses context default)
}
```

#### Return Types

**Tuple Destructuring** (useState-compatible):
```typescript
[value: T, setValue: (value: T | ((prev: T) => T)) => void, removeValue: () => void]
```

**Object Destructuring** (Full-featured):
```typescript
{
  data: T,                                    // The stored data
  update: (value: T | ((prev: T) => T)) => void, // Update function
  reset: () => void,                          // Reset to default
  loading: boolean,                           // Loading state
  persisted: boolean,                         // Persistence status
  error: Error | null,                        // Error state
  lastUpdated: Date | null,                   // Last update timestamp
  refresh: () => Promise<void>                // Force refresh from DB
}
```

### Global Configuration

Configure global defaults for all hooks and the exported `idb` instance:

```typescript
import { configureIDBStorage } from 'use-idb-storage';

configureIDBStorage({
  database: 'my-app',
  version: 1,
  store: 'data'
});
```

This sets the global defaults that are used by:
- All `useIDBStorage` hooks (unless explicitly overridden)
- The exported `idb` instance

### Configuration

```typescript
interface IDBConfigValues {
  database: string;    // IndexedDB database name
  version?: number;    // Database version (default: 1)
  store: string;       // Default object store name
}

// Configure global defaults
configureIDBStorage({
  database: 'my-app',
  version: 1,
  store: 'data'
});
```

## Examples

### User Authentication

```tsx
function AuthProvider({ children }) {
  const { data: user, update: setUser, reset: logout, loading } = useIDBStorage({
    key: 'auth-user',
    defaultValue: null
  });

  const login = async (credentials) => {
    try {
      const userData = await api.login(credentials);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Shopping Cart

```tsx
function ShoppingCart() {
  const {
    data: cart,
    update: updateCart,
    reset: clearCart,
    persisted,
    lastUpdated
  } = useIDBStorage({
    key: 'shopping-cart',
    defaultValue: { items: [], total: 0 }
  });

  const addItem = (item) => {
    updateCart(prev => ({
      items: [...prev.items, item],
      total: prev.total + item.price
    }));
  };

  return (
    <div>
      <h2>Cart ({cart.items.length} items)</h2>
      {cart.items.map(item => (
        <div key={item.id}>{item.name} - ${item.price}</div>
      ))}
      <p>Total: ${cart.total}</p>
      <button onClick={clearCart}>Clear Cart</button>
      <div>
        Status: {persisted ? 'Saved' : 'Saving...'}
        {lastUpdated && <span> • Saved {lastUpdated.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
```

### Auto-Save Form

```tsx
function AutoSaveForm() {
  const {
    data: formData,
    update: updateForm,
    loading,
    error,
    lastUpdated
  } = useIDBStorage({
    key: 'draft-form',
    defaultValue: { title: '', content: '', tags: [] }
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Auto-saved at', new Date().toLocaleTimeString());
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  if (loading) return <div>Loading draft...</div>;
  if (error) return <div>Failed to load draft: {error.message}</div>;

  return (
    <form>
      <input
        value={formData.title}
        onChange={e => updateForm(prev => ({ ...prev, title: e.target.value }))}
        placeholder="Title"
      />
      <textarea
        value={formData.content}
        onChange={e => updateForm(prev => ({ ...prev, content: e.target.value }))}
        placeholder="Content"
      />
      <div>
        {lastUpdated && (
          <small>Last saved: {lastUpdated.toLocaleTimeString()}</small>
        )}
      </div>
    </form>
  );
}
```

### Error Handling

```tsx
function RobustComponent() {
  const {
    data: settings,
    update: updateSettings,
    reset: resetSettings,
    error,
    refresh,
    loading
  } = useIDBStorage({
    key: 'user-settings',
    defaultValue: { theme: 'light', notifications: true }
  });

  if (error) {
    return (
      <div>
        <p>Failed to load settings: {error.message}</p>
        <button onClick={() => refresh()}>Retry</button>
        <button onClick={resetSettings}>Reset to Defaults</button>
      </div>
    );
  }

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <label>
        Theme:
        <select
          value={settings.theme}
          onChange={e => updateSettings(prev => ({
            ...prev,
            theme: e.target.value
          }))}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  );
}
```

## Advanced Usage

### Custom Configuration

```tsx
import { configureIDBStorage, useIDBStorage, idb } from 'use-idb-storage';

// Configure global defaults
configureIDBStorage({
  database: 'my-app',
  version: 2,
  store: 'data'
});

function MyComponents() {
  // Uses global config: database="my-app", store="data"
  const [user] = useIDBStorage({
    key: 'user',
    defaultValue: { name: '' }
  });

  // Overrides store: database="my-app", store="cache"
  const [cache] = useIDBStorage({
    key: 'api-cache',
    defaultValue: {},
    store: 'cache'
  });

  // Uses global config: database="my-app", store="data"
  const saveToGlobalStore = async () => {
    const store = await idb.store;
    await store.set('global-key', 'global-value');
  };

  return <div>...</div>;
}
```

### Migration

Increment version for schema changes:

```tsx
<IDBConfig database="my-app" version={1} store="data">
  <App />
</IDBConfig>

<IDBConfig database="my-app" version={2} store="data">
  <App />
</IDBConfig>
```

### Class-based API

```tsx
import { IDBStorage } from 'use-idb-storage';

const db = new IDBStorage({ database: 'my-app' });
const store = await db.get('analytics');

await store.setMany([
  ['pageviews', 1234],
  ['sessions', 89],
  ['bounce-rate', 0.45]
]);

const allKeys = await store.keys();
const allData = await store.values();
```



## 🌐 Browser Support

- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

## 📄 License

ISC
