import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeCollections } from './utils/initializeFirebase';

// Initialize Firebase collections immediately
initializeCollections().catch(error => {
  // Only log errors that aren't permission-denied
  if (error?.code !== 'permission-denied') {
    console.error('Error initializing Firebase collections:', error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);