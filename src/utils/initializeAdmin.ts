import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

let initializationInProgress = false;
let lastAttemptTime = 0;
const RETRY_DELAY = 60000; // 1 minute delay between attempts

export async function createAdminUser() {
  const now = Date.now();
  if (now - lastAttemptTime < RETRY_DELAY) {
    console.log('Please wait before trying again');
    throw new Error('Please wait before trying again');
  }

  if (initializationInProgress) {
    console.log('Admin initialization already in progress');
    throw new Error('Admin initialization already in progress');
  }

  initializationInProgress = true;
  lastAttemptTime = now;

  try {
    // Check if admin document exists first
    const adminQuery = doc(db, 'users', 'admin');
    const adminDoc = await getDoc(adminQuery);

    if (adminDoc.exists()) {
      console.log('Admin user document exists');
      return;
    }

    const auth = getAuth();
    const email = 'kudamusasiwa@gmail.com';
    const password = '1234Abcd!';

    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Admin user exists, signed in successfully');
      
      // Update admin user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name: 'Kuda Musasiwa',
        phone: '+263712311634',
        role: 'admin',
        active: true,
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
      
    } catch (signInError: any) {
      if (signInError.code === 'auth/too-many-requests') {
        console.log('Too many sign-in attempts. Please try again later.');
        throw signInError;
      }

      if (signInError.code === 'auth/user-not-found') {
        // Create new admin user
        console.log('Creating new admin user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          name: 'Kuda Musasiwa',
          phone: '+263712311634',
          role: 'admin',
          active: true,
          lastLogin: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        console.log('Admin user created successfully');
      } else {
        throw signInError;
      }
    }
  } catch (error: any) {
    console.error('Error creating/updating admin user:', error.message);
    throw error;
  } finally {
    initializationInProgress = false;
  }
}