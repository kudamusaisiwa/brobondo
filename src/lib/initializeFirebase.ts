import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache,
  persistentMultipleTabManager,
  enableMultiTabIndexedDbPersistence
} from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: "https://brobondo-e20e6-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize other services
const auth = getAuth(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

// Set auth persistence
async function initializeAuth() {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence set to local');
  } catch (error) {
    console.error('Error setting auth persistence:', error);
  }
}

// Enable Firestore persistence
async function enableFirestorePersistence() {
  try {
    await enableMultiTabIndexedDbPersistence(db);
    console.log('Firestore persistence enabled');
  } catch (error) {
    console.error('Error enabling Firestore persistence:', error);
  }
}

// Initialize all Firebase services
async function initializeFirebaseServices() {
  try {
    await initializeAuth();
    await enableFirestorePersistence();
    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
  }
}

// Initialize services
initializeFirebaseServices();

export { app, auth, db, rtdb, storage };
