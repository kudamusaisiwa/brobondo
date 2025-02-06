import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  signInAnonymously
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration from environment variables
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);

// Auth helper functions
export const signIn = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const updateUserProfile = (user, profile) => 
  updateProfile(user, profile);

export const updateUserPassword = (user, newPassword) => 
  updatePassword(user, newPassword);

export const reauth = (user, password) => 
  reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email, password)
  );

export const sendPasswordResetEmail = (email) => 
  firebaseSendPasswordResetEmail(auth, email);

export const setAuthPersistence = () => 
  setPersistence(auth, browserLocalPersistence);

export const signOutUser = () => signOut(auth);

export const signInAnon = () => signInAnonymously(auth);

// Password validation function
export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

export { app, db, auth, rtdb };