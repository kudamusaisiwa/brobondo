import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  // Just check if the system is initialized
  try {
    const isInitialized = await checkInitialization();
    return isInitialized;
  } catch (error: any) {
    console.error('Error checking system initialization:', error);
    return false;
  }
}

export async function initializeCollections() {
  // Just check if the system is initialized
  return await initializeSystem();
}