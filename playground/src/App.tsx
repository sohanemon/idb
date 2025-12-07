import React, { useEffect, useState } from 'react';
import { IDBConfig, IDBStorage, useIDBStorage } from '../../dist/index.js';

export function App() {
  return (
    <IDBConfig database="playground3" version={2} store="playground-store-2">
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>IndexedDB Storage Playground</h1>
        <p>
          This playground demonstrates the useIDBStorage hook functionality.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <h2>User Profile</h2>
          <UserProfile />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Counter</h2>
          <Counter />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Todo List</h2>
          <TodoList />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Settings</h2>
          <Settings />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Settings</h2>
          <Settings />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>IDBStorage Utils</h2>
          <IDBStorageUtils />
        </div>
      </div>
    </IDBConfig>
  );
}

function UserProfile() {
  const [user, setUser, removeUser] = useIDBStorage({
    key: 'user-profile',
    defaultValue: { name: '', email: '', age: 0 },
  });

  const [tempUser, setTempUser] = useState(user);

  const handleSave = async () => {
    await setUser(tempUser);
  };

  const handleRemove = async () => {
    await removeUser();
    setTempUser({ name: '', email: '', age: 0 });
  };

  React.useEffect(() => {
    setTempUser(user);
  }, [user]);

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}
    >
      <h3>Edit Profile</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>Name: </label>
        <input
          type="text"
          value={tempUser.name}
          onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })}
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Email: </label>
        <input
          type="email"
          value={tempUser.email}
          onChange={(e) => setTempUser({ ...tempUser, email: e.target.value })}
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Age: </label>
        <input
          type="number"
          value={tempUser.age}
          onChange={(e) =>
            setTempUser({ ...tempUser, age: parseInt(e.target.value) || 0 })
          }
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{ marginRight: '10px', padding: '5px 10px' }}
      >
        Save Profile
      </button>
      <button onClick={handleRemove} style={{ padding: '5px 10px' }}>
        Clear Profile
      </button>
      <div style={{ marginTop: '10px' }}>
        <strong>Stored Profile:</strong> {JSON.stringify(user, null, 2)}
      </div>
    </div>
  );
}

function Counter() {
  const [count, setCount] = useIDBStorage({
    key: 'counter',
    defaultValue: 0,
  });

  const increment = async () => {
    await setCount(count + 1);
  };

  const decrement = async () => {
    await setCount(count - 1);
  };

  const reset = async () => {
    await setCount(0);
  };

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}
    >
      <h3>Persistent Counter</h3>
      <div style={{ fontSize: '24px', margin: '10px 0' }}>Count: {count}</div>
      <button
        onClick={increment}
        style={{ marginRight: '10px', padding: '5px 10px' }}
      >
        +
      </button>
      <button
        onClick={decrement}
        style={{ marginRight: '10px', padding: '5px 10px' }}
      >
        -
      </button>
      <button onClick={reset} style={{ padding: '5px 10px' }}>
        Reset
      </button>
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        This counter persists across page reloads!
      </p>
    </div>
  );
}

function TodoList() {
  const [todos, setTodos] = useIDBStorage({
    key: 'todos',
    defaultValue: [] as string[],
  });

  const [newTodo, setNewTodo] = useState('');

  const addTodo = async () => {
    if (newTodo.trim()) {
      await setTodos([...todos, newTodo.trim()]);
      setNewTodo('');
    }
  };

  const removeTodo = async (index: number) => {
    const newTodos = todos.filter((_, i) => i !== index);
    await setTodos(newTodos);
  };

  const clearAll = async () => {
    await setTodos([]);
  };

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}
    >
      <h3>Persistent Todo List</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          style={{ padding: '5px', width: '200px', marginRight: '10px' }}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo} style={{ padding: '5px 10px' }}>
          Add
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            {todo}
            <button
              onClick={() => removeTodo(index)}
              style={{
                marginLeft: '10px',
                padding: '2px 5px',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {todos.length > 0 && (
        <button
          onClick={clearAll}
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          Clear All
        </button>
      )}
    </div>
  );
}

function Settings() {
  const [settings, setSettings] = useIDBStorage({
    key: 'app-settings',
    defaultValue: {
      theme: 'light' as 'light' | 'dark',
      notifications: true,
      language: 'en',
    },
  });

  const updateSetting = async <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    await setSettings({ ...settings, [key]: value });
  };

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}
    >
      <h3>App Settings</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Theme:
          <select
            value={settings.theme}
            onChange={(e) =>
              updateSetting('theme', e.target.value as 'light' | 'dark')
            }
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Notifications:
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => updateSetting('notifications', e.target.checked)}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Language:
          <select
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </label>
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>Current Settings:</strong> {JSON.stringify(settings, null, 2)}
      </div>
    </div>
  );
}

function IDBStorageUtils() {
  const [storage] = useState(
    () =>
      new IDBStorage({
        database: 'playground3',
        version: 2,
        store: 'utils-store',
      }),
  );
  const [store, setStore] = useState<any>(null);
  const [key, setKey] = useState('test-key');
  const [value, setValue] = useState('test-value');
  const [result, setResult] = useState<any>(null);
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initStore = async () => {
      const s = await storage.store;
      setStore(s);
      await refreshKeys(s);
    };
    initStore();
  }, [storage]);

  const refreshKeys = async (s: any) => {
    if (s) {
      const k = await s.keys();
      setKeys(k);
    }
  };

  const handleGet = async () => {
    if (!store) return;
    setLoading(true);
    try {
      const val = await store.get(key);
      setResult(val);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
    setLoading(false);
  };

  const handleSet = async () => {
    if (!store) return;
    setLoading(true);
    try {
      await store.set(key, value);
      setResult('Set successfully');
      await refreshKeys(store);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!store) return;
    setLoading(true);
    try {
      await store.delete(key);
      setResult('Deleted successfully');
      await refreshKeys(store);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
    setLoading(false);
  };

  const handleGetMany = async () => {
    if (!store) return;
    setLoading(true);
    try {
      const vals = await store.getMany([key, 'another-key', 'third-key']);
      setResult(vals);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
    setLoading(false);
  };

  const handleSetMany = async () => {
    if (!store) return;
    setLoading(true);
    try {
      await store.setMany([
        [key, value],
        ['batch-key-1', 'batch-value-1'],
        ['batch-key-2', 'batch-value-2'],
      ]);
      setResult('Set many successfully');
      await refreshKeys(store);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!store) return;
    setLoading(true);
    try {
      await store.update(key, (val: any) =>
        val ? val + ' (updated)' : 'new value',
      );
      setResult('Updated successfully');
      await refreshKeys(store);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
    setLoading(false);
  };

  const handleClear = async () => {
    if (!store) return;
    setLoading(true);
    try {
      await store.clear();
      setResult('Cleared successfully');
      await refreshKeys(store);
    } catch (e) {
      setResult(`Error: ${e}`);
    }
    setLoading(false);
  };

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}
    >
      <h3>IDBStorage Direct Utils</h3>
      <p>Demonstrates direct usage of IDBStorage and IDBStore classes</p>

      <div style={{ marginBottom: '10px' }}>
        <label>Key: </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
        />
        <label style={{ marginLeft: '20px' }}>Value: </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={handleGet}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Get
        </button>
        <button
          onClick={handleSet}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Set
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Delete
        </button>
        <button
          onClick={handleGetMany}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Get Many
        </button>
        <button
          onClick={handleSetMany}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Set Many
        </button>
        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Update
        </button>
        <button
          onClick={handleClear}
          disabled={loading}
          style={{ padding: '5px 10px' }}
        >
          Clear All
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Result:</strong> {JSON.stringify(result, null, 2)}
      </div>

      <div>
        <strong>All Keys:</strong> {JSON.stringify(keys)}
      </div>
    </div>
  );
}
