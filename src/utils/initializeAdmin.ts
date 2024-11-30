import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function createAdminUser() {
  const auth = getAuth();
  const email = 'kudamusasiwa@gmail.com';
  const password = '1234Abcd!';

  try {
    // First try to sign in with existing credentials
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Admin user exists, signed in successfully');
      
      // Update or create admin user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name: 'Kuda Musasiwa',
        phone: '+263712311634',
        role: 'admin',
        active: true,
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true }); // Use merge to preserve existing data
      
      return;
    } catch (signInError: any) {
      // Only proceed with creation if the error is user-not-found
      if (signInError.code !== 'auth/user-not-found') {
        console.log('Admin user exists but sign-in failed:', signInError.message);
        return;
      }
    }

    // If we get here, the user doesn't exist, so create new admin user
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
  } catch (error: any) {
    // Handle specific errors
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
      return; // Not a real error, just means user exists
    }
    
    // Ignore permission errors during initial setup
    if (error.code === 'permission-denied') {
      return;
    }

    console.error('Error creating admin user:', error);
    throw error;
  }
}