import React, { useState } from 'react';
import { IDBConfig, useIDBStorage } from '../../dist/index.js';

export function App() {
  return (
    <IDBConfig database="playground-db-2" store="playground-store">
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
