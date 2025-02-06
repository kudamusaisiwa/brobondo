import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD0XqhrVDGuxp6oTHRBwb2UFA3DFV_fcUk",
  authDomain: "brobondo-e20e6.firebaseapp.com",
  databaseURL: "https://brobondo-e20e6-default-rtdb.firebaseio.com",
  projectId: "brobondo-e20e6",
  storageBucket: "brobondo-e20e6.firebasestorage.app",
  messagingSenderId: "59908898572",
  appId: "1:59908898572:web:88bb1dd62390d7f57dd329",
  measurementId: "G-ZV4QEPTLFX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProperties() {
  try {
    const propertiesRef = collection(db, 'properties');
    const snapshot = await getDocs(propertiesRef);
    
    console.log(`Total properties: ${snapshot.size}`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Property: ${data.title}, Status: ${data.status}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProperties();
