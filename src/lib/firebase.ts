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
  browserLocalPersistence,
  connectAuthEmulator,
  onAuthStateChanged,
  User
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
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableMultiTabIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getDatabase, 
  connectDatabaseEmulator 
} from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Emulator configuration
const EMULATOR_HOST = 'localhost';
const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
  database: 9000,
  storage: 9199
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Network and connection utilities
const networkUtils = {
  isEmulatorRunning: async (host: string, port: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://${host}:${port}`);
      return response.ok;
    } catch {
      return false;
    }
  },

  setupEmulators: async () => {
    if (import.meta.env.DEV) {
      const emulatorChecks = await Promise.all([
        networkUtils.isEmulatorRunning(EMULATOR_HOST, EMULATOR_PORTS.auth),
        networkUtils.isEmulatorRunning(EMULATOR_HOST, EMULATOR_PORTS.firestore),
        networkUtils.isEmulatorRunning(EMULATOR_HOST, EMULATOR_PORTS.database),
        networkUtils.isEmulatorRunning(EMULATOR_HOST, EMULATOR_PORTS.storage)
      ]);

      console.log('Emulator status:', {
        auth: emulatorChecks[0],
        firestore: emulatorChecks[1],
        database: emulatorChecks[2],
        storage: emulatorChecks[3]
      });

      if (emulatorChecks.some(status => status)) {
        // Connect to running emulators
        connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`);
        connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
        connectDatabaseEmulator(rtdb, EMULATOR_HOST, EMULATOR_PORTS.database);
        connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
        
        console.log('Firebase emulators connected');
      } else {
        console.warn('No Firebase emulators detected. Using production services.');
      }
    }
  },

  isOnline: () => navigator.onLine,
  
  waitForConnection: (timeout = 10000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (navigator.onLine) {
        resolve(true);
        return;
      }

      const checkConnection = () => {
        if (navigator.onLine) {
          window.removeEventListener('online', checkConnection);
          resolve(true);
        }
      };

      window.addEventListener('online', checkConnection);

      // Timeout to prevent infinite waiting
      setTimeout(() => {
        window.removeEventListener('online', checkConnection);
        resolve(false);
      }, timeout);
    });
  },

  handleNetworkError: async (error: any): Promise<never> => {
    console.error('Network request failed:', error);
    
    // Specific error handling
    if (error.code === 'auth/network-request-failed') {
      const connectionRestored = await networkUtils.waitForConnection();
      
      if (connectionRestored) {
        console.log('Network connection restored. Retrying...');
        throw new FirebaseAuthError('Network connection restored. Please retry.', 'network-reconnected');
      } else {
        throw new FirebaseAuthError('Unable to establish network connection. Please check your internet.', 'network-unavailable');
      }
    }

    throw error;
  }
};

// Advanced network and authentication error handling
class FirebaseAuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FirebaseAuthError';
  }
}

// Initialize Realtime Database first
const rtdb = getDatabase(app);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  cache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: 'unlimited'
  })
});

// Initialize other services
const auth = getAuth(app);
const storage = getStorage(app);

// Enable multi-tab persistence
const enableFirestorePersistence = async () => {
  try {
    await enableMultiTabIndexedDbPersistence(db);
    console.log('Firestore multi-tab persistence enabled');
  } catch (error) {
    console.error('Error enabling Firestore persistence:', error);
  }
};

// Set Auth persistence with advanced error handling
const initializeAuthPersistence = async () => {
  try {
    if (!networkUtils.isOnline()) {
      await networkUtils.waitForConnection();
    }

    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence set successfully');
  } catch (error) {
    console.error('Error setting auth persistence:', error);
    await networkUtils.handleNetworkError(error);
  }
};

// Network connection monitoring
const setupNetworkMonitoring = () => {
  const checkNetworkConnection = () => {
    if (navigator.onLine) {
      console.log('Network connection restored');
    } else {
      console.warn('Network connection lost. App will operate in offline mode.');
    }
  };

  window.addEventListener('online', checkNetworkConnection);
  window.addEventListener('offline', checkNetworkConnection);

  // Initial network status check
  checkNetworkConnection();
};

// Initialize all Firebase services
const initializeFirebaseServices = async () => {
  try {
    // Setup emulators if in development
    await networkUtils.setupEmulators();

    // Ensure network connection
    if (!networkUtils.isOnline()) {
      await networkUtils.waitForConnection();
    }

    // Initialize persistence mechanisms
    await initializeAuthPersistence();
    await enableFirestorePersistence();

    // Setup network monitoring
    setupNetworkMonitoring();

    // Advanced auth state monitoring
    onAuthStateChanged(auth, 
      (user: User | null) => {
        if (user) {
          console.log('User is signed in:', user.email);
        } else {
          console.log('No user is signed in.');
        }
      }, 
      (error) => {
        console.error('Auth state change error:', error);
      }
    );

    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    
    // Handle specific network errors
    if (error instanceof FirebaseAuthError) {
      switch (error.code) {
        case 'network-unavailable':
          alert('No internet connection. Please check your network.');
          break;
        case 'network-reconnected':
          alert('Network restored. Please retry your last action.');
          break;
      }
    }
  }
};

// Call initialization on module load
initializeFirebaseServices();

// Utility functions
const isFirebaseInitialized = () => {
  return !!app && !!auth && !!db;
};

const fromFirebaseTimestamp = (timestamp: any): Date => {
  return timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const sendPasswordResetEmail = async (email: string) => {
  try {
    if (!networkUtils.isOnline()) {
      await networkUtils.waitForConnection();
    }
    
    await firebaseSendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error: any) {
    console.error('Password reset error:', error);
    await networkUtils.handleNetworkError(error);
    
    return { 
      success: false, 
      message: error.code === 'auth/user-not-found' 
        ? 'No user found with this email' 
        : 'Failed to send password reset email' 
    };
  }
};

const handleFirestoreError = (error: any): string => {
  if (!error) return 'Unknown error occurred';

  switch (error.code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action';
    case 'not-found':
      return 'The requested document was not found';
    case 'already-exists':
      return 'The document already exists';
    case 'invalid-argument':
      return 'Invalid argument provided';
    case 'deadline-exceeded':
      return 'Operation took too long and was cancelled';
    case 'unavailable':
      return 'Service is currently unavailable';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    default:
      console.error('Unhandled Firestore error:', error);
      return 'An unexpected error occurred';
  }
};

// Explicit exports
export { 
  app, 
  auth, 
  db, 
  rtdb, 
  storage, 
  networkUtils,
  isFirebaseInitialized,
  fromFirebaseTimestamp,
  validatePassword,
  sendPasswordResetEmail,
  handleFirestoreError
};

export default app;