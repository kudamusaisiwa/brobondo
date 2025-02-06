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
  apiKey: "AIzaSyD0XqhrVDGuxp6oTHRBwb2UFA3DFV_fcUk",
  authDomain: "brobondo-e20e6.firebaseapp.com",
  projectId: "brobondo-e20e6",
  storageBucket: "brobondo-e20e6.firebasestorage.app",
  messagingSenderId: "59908898572",
  appId: "1:59908898572:web:88bb1dd62390d7f57dd329",
  measurementId: "G-ZV4QEPTLFX",
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
