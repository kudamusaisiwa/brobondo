const { getFirestore } = require('firebase-admin/firestore');
const { initializeFirebaseServices } = require('./firebase.js');

async function initializeTenantsCollection() {
  try {
    // Initialize Firebase services
    const { db } = await initializeFirebaseServices();
    console.log('Firebase services initialized');

    // Get a reference to the tenants collection
    const tenantsCollectionRef = db.collection('tenants');
    console.log('Got reference to tenants collection');

    // Create the collection by adding a sample document
    const tempDocRef = tenantsCollectionRef.doc('temp');
    await tempDocRef.set({
      _initialized: true,
      createdAt: new Date()
    });
    console.log('Created temporary document');

    // Delete the temporary document
    await tempDocRef.delete();
    console.log('Deleted temporary document');

    console.log('Tenants collection initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing tenants collection:', error);
    throw error;
  }
}

module.exports = { initializeTenantsCollection };
