# IndexedDB Storage Playground

This playground demonstrates the `useIDBStorage` hook functionality with various data types and use cases.

## Features Demonstrated

- **User Profile**: Object storage with form inputs
- **Counter**: Primitive number storage with increment/decrement
- **Todo List**: Array storage with dynamic list management
- **Settings**: Complex object with multiple data types

## How to Run

```bash
npm run playground
```

Then open http://localhost:5173 in your browser.

## What You'll See

The playground shows four different components, each demonstrating different aspects of the `useIDBStorage` hook:

1. **User Profile** - Edit and save user information (persists across reloads)
2. **Counter** - A simple counter that remembers its value
3. **Todo List** - Add and remove todos (array storage)
4. **Settings** - App settings with different data types

All data persists in IndexedDB and survives page reloads and browser restarts.

## Testing Persistence

- Add some data in each section
- Refresh the page - the data should still be there
- Open browser dev tools → Application → IndexedDB to see the stored data
- Clear the data using the "Clear" buttons to test removal functionality