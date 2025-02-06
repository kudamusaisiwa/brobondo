const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeDatabase() {
  try {
    // Create system settings
    await setDoc(doc(db, 'system', 'settings'), {
      initialized: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Initialize collections
    const collections = [
      'users',
      'customers',
      'orders',
      'products',
      'activities',
      'payments',
      'communications',
      'deliverySchedules',
      'expenses',
      'customerDocuments'
    ];
    
    for (const collectionName of collections) {
      await setDoc(doc(db, collectionName, '_init'), {
        initialized: true,
        createdAt: Timestamp.now()
      });
      console.log(`Initialized collection: ${collectionName}`);
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
