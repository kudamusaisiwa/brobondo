import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createAdminUser } from './initializeAdmin';

let initializationInProgress = false;

export async function checkInitialization() {
  try {
    // First check system settings
    const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
    if (settingsDoc.exists() && settingsDoc.data()?.initialized === true) {
      return true;
    }

    // Then check if temp admin exists during development
    if (process.env.NODE_ENV === 'development') {
      const tempAdminDoc = await getDoc(doc(db, 'users', 'temp-admin'));
      if (tempAdminDoc.exists()) {
        return true;
      }
    }

    return false;
  } catch (error) {
    // Ignore permission errors during initial check
    if (error?.code === 'permission-denied') {
      return false;
    }
    console.error('Error checking initialization:', error);
    return false;
  }
}

export async function initializeSystem() {
  if (initializationInProgress) {
    console.log('Initialization already in progress');
    return false;
  }

  try {
    initializationInProgress = true;

    // Check if already initialized
    const isInitialized = await checkInitialization();
    if (isInitialized) {
      console.log('System already initialized');
      return true;
    }

    // Try to create admin user first
    try {
      await createAdminUser();
    } catch (error) {
      if (error?.code === 'auth/too-many-requests') {
        console.log('Too many authentication attempts. Please try again later.');
        return false;
      }
      // Other errors we can proceed with initialization
      console.warn('Could not create admin user:', error);
    }

    // Create system settings
    await setDoc(doc(db, 'system', 'settings'), {
      initialized: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });

    // Create temp admin document during development
    if (process.env.NODE_ENV === 'development') {
      await setDoc(doc(db, 'users', 'temp-admin'), {
        email: 'temp@admin.dev',
        name: 'Temporary Admin',
        role: 'admin',
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    // Initialize collections
    const collections = ['customers', 'orders', 'products', 'activities', 'payments', 'communications', 'deliverySchedules'];
    
    for (const collectionName of collections) {
      await setDoc(doc(db, collectionName, '_init'), {
        initialized: true,
        createdAt: Timestamp.now()
      });
    }

    // Update system settings to mark initialization as complete
    await setDoc(doc(db, 'system', 'settings'), {
      initialized: true,
      updatedAt: Timestamp.now()
    }, { merge: true });

    console.log('System initialized successfully');
    return true;
  } catch (error: any) {
    console.error('Error initializing system:', error);
    return false;
  } finally {
    initializationInProgress = false;
  }
}

export async function initializeCollections() {
  if (initializationInProgress) {
    console.log('Initialization already in progress');
    return false;
  }

  try {
    const isInitialized = await checkInitialization();
    if (isInitialized) {
      console.log('System already initialized');
      return true;
    }

    return await initializeSystem();
  } catch (error) {
    console.error('Error initializing collections:', error);
    return false;
  }
}