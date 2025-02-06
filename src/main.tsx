import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeCollections } from './utils/initializeFirebase';

// Check system initialization status silently
initializeCollections().catch(() => {
  // Ignore initialization check errors
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);