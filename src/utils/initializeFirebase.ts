import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createAdminUser } from './initializeAdmin';

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
  try {
    // Create system settings first to enable permissions
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
    // Handle specific errors
    if (error.code === 'auth/email-already-in-use') {
      // Not a real error, just means admin exists
      console.log('Admin user already exists, continuing initialization...');
      return initializeSystem();
    }

    if (error.code === 'permission-denied') {
      // If permission denied, try creating admin user first
      await createAdminUser();
      // Then retry initialization
      return initializeSystem();
    }

    console.error('Error initializing system:', error);
    return false;
  }
}

export async function initializeCollections() {
  try {
    const isInitialized = await checkInitialization();
    if (isInitialized) {
      console.log('System already initialized');
      return true;
    }

    try {
      // Create admin user first
      await createAdminUser();
    } catch (adminError: any) {
      // If admin already exists, continue with system initialization
      if (adminError.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists, continuing initialization...');
      } else {
        throw adminError;
      }
    }

    // Then initialize system
    await initializeSystem();
    return true;
  } catch (error: any) {
    console.error('Error during collection initialization:', error);
    throw error;
  }
}