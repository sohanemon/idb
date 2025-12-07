# IndexedDB Storage Playground

This playground demonstrates the `useIDBStorage` hook functionality with various data types and use cases.

## Features Demonstrated

- **User Profile**: Object storage with form inputs
- **Counter**: Primitive number storage with increment/decrement
- **Todo List**: Array storage with dynamic list management
- **Settings**: Complex object with multiple data types

## Local Development

```bash
npm run playground
```

Then open http://localhost:5173 in your browser.

## Vercel Deployment

The playground is configured for easy deployment to Vercel:

### Automatic Deployment
1. Push this code to a GitHub repository
2. Connect the repository to Vercel
3. Vercel will automatically detect the configuration and deploy

### Manual Deployment
```bash
# Build the playground
npm run build:playground

# Deploy to Vercel (if Vercel CLI is installed)
vercel --prod
```

## Configuration

The playground uses:
- `vercel.json` - Configures build command and output directory
- `playground/vite.config.ts` - Builds to `dist-playground` directory
- Relative paths for assets to work on any domain

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