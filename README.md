# SW Images Example

A modern image gallery with drag-and-drop upload, built with React, Service Workers, and IndexedDB.

## Features

- 📤 **Drag & Drop Upload**: Upload images by dragging them onto the page or using the file picker
- 🖼️ **Image Gallery**: View all your uploaded images in a responsive grid
- 🔍 **Image Modal**: Click any image to view it in full size
- 🗑️ **Delete Images**: Remove images with a single click
- 📦 **Offline Storage**: Images stored in IndexedDB persist across sessions
- ⚡ **Fast Loading**: Cache API ensures instant image loading
- 🎨 **WebP Conversion**: Automatically converts PNG/JPG to WebP for smaller file sizes
- 💾 **Service Worker**: All processing happens client-side using service workers

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Hono** - Service worker routing
- **IndexedDB** (via idb-keyval) - Image storage
- **TanStack Query** - Data fetching
- **OffscreenCanvas** - Image conversion

## Development

```bash
# Install dependencies
npm install

# Build service worker
npm run build:sw

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for GitHub Pages deployment. Push to the `master` branch to trigger automatic deployment.

For local development, the app runs at `http://localhost:5173/`.

For GitHub Pages, it will be available at `https://yourusername.github.io/sw-images-example/`.

## How It Works

1. **Upload**: Images are uploaded via drag-and-drop or file selection
2. **Conversion**: PNG/JPG images are automatically converted to WebP using OffscreenCanvas
3. **Storage**: Images are stored in IndexedDB with unique IDs
4. **Caching**: First load stores images in Cache API for instant subsequent loads
5. **Service Worker**: Hono-based service worker handles all image serving and routing
6. **Delete**: Removes images from both IndexedDB and Cache API

## License

MIT
