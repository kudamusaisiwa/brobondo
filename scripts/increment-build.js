import { getNextBuildNumber } from '../src/utils/buildTracking.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function incrementBuild() {
  try {
    // Get next build number from Firebase
    const nextBuildNumber = await getNextBuildNumber();
    
    // Update package.json
    const packagePath = path.join(__dirname, '..', 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    pkgJson.buildNumber = nextBuildNumber.toString();
    
    // Write updated package.json
    fs.writeFileSync(packagePath, JSON.stringify(pkgJson, null, 2) + '\n');
    
    console.log(`Build number incremented to ${nextBuildNumber}`);
  } catch (error) {
    console.error('Error incrementing build number:', error);
    process.exit(1);
  }
}

incrementBuild();