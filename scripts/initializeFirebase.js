const initializeTenantsCollection = require('../src/lib/initializeTenants.js').initializeTenantsCollection;

async function initializeCollections() {
  try {
    console.log('Starting Firebase collections initialization...');
    
    // Initialize tenants collection
    await initializeTenantsCollection();
    console.log(' Tenants collection initialized successfully');
    
    console.log('All collections initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing collections:', error);
    process.exit(1);
  }
}

initializeCollections();
