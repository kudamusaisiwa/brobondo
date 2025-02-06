import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  addDoc,
  Timestamp,
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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const storage = getStorage(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true, // Add long polling for better connection stability
  experimentalAutoDetectLongPolling: true
});

// Initialize Realtime Database
const rtdb = getDatabase(app);

// Enable multi-tab persistence
const enableFirestorePersistence = async () => {
  try {
    await enableMultiTabIndexedDbPersistence(db);
    console.log('Firestore persistence enabled');
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (error.code === 'unimplemented') {
      console.warn('Browser doesn\'t support persistence');
    } else {
      console.error('Error enabling persistence:', error);
    }
  }
};

// Initialize Firebase services
const initializeFirebaseServices = async () => {
  try {
    // Set auth persistence
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence set to local');

    // Enable Firestore persistence
    await enableFirestorePersistence();
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
  }
};

// Initialize services
initializeFirebaseServices();

export { app, auth, db, rtdb, storage };
