import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD0XqhrVDGuxp6oTHRBwb2UFA3DFV_fcUk',
  authDomain: 'brobondo-e20e6.firebaseapp.com',
  projectId: 'brobondo-e20e6',
  storageBucket: 'brobondo-e20e6.firebasestorage.app',
  messagingSenderId: '59908898572',
  appId: '1:59908898572:web:88bb1dd62390d7f57dd329',
  measurementId: 'G-ZV4QEPTLFX',
  databaseURL: 'https://brobondo-e20e6-default-rtdb.firebaseio.com'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createUserDocument() {
  try {
    // Sign in first to get the user ID
    const userCredential = await signInWithEmailAndPassword(auth, 'kudamusasiwa@gmail.com', 'Brobondo@2025');
    console.log('Signed in successfully, user ID:', userCredential.user.uid);

    // Create the user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: 'kudamusasiwa@gmail.com',
      name: 'Kuda Musasiwa',
      phone: '+263712311634',
      role: 'admin',
      active: true,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created user document in Firestore');
  } catch (error) {
    console.error('Error:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
  }
}

createUserDocument();
