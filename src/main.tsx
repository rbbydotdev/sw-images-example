import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker with base path support
if ('serviceWorker' in navigator) {
  const basePath = __BASE_PATH__.replace(/\/$/, ''); // Remove trailing slash
  navigator.serviceWorker.register(`${basePath}/sw.js`, {
    scope: basePath || '/',
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
