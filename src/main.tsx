import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker with base path support
if ('serviceWorker' in navigator) {
  const basePath = __BASE_PATH__; // Keep trailing slash for scope
  const swPath = basePath.endsWith('/') ? `${basePath}sw.js` : `${basePath}/sw.js`;

  navigator.serviceWorker.register(swPath, {
    scope: basePath,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
