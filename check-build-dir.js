// Check Build Directory Script
// This script examines the build directory structure

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Possible build output directories to check
const possibleBuildDirs = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), 'dist', 'public'),
  path.resolve(process.cwd(), 'build'),
  path.resolve(process.cwd(), 'public')
];

// Function to recursively list files in a directory
function listFiles(dir, indent = '', maxDepth = 3, currentDepth = 0) {
  if (currentDepth > maxDepth) {
    console.log(`${indent}... (max depth reached)`);
    return;
  }
  
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        console.log(`${indent}📁 ${file}/`);
        listFiles(filePath, indent + '  ', maxDepth, currentDepth + 1);
      } else {
        // Get file size in KB
        const fileSizeKB = Math.round(stats.size / 1024 * 10) / 10;
        console.log(`${indent}📄 ${file} (${fileSizeKB} KB)`);
      }
    }
  } catch (err) {
    console.log(`${indent}Error reading directory: ${err.message}`);
  }
}

// Check each possible build directory
console.log('Checking build directories...\n');
let foundBuildDir = false;

for (const buildDir of possibleBuildDirs) {
  if (fs.existsSync(buildDir)) {
    console.log(`Found build directory: ${buildDir}`);
    console.log('Directory structure:');
    listFiles(buildDir);
    
    // Check specifically for index.html
    const indexPath = path.join(buildDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`\n✅ Found index.html in ${buildDir}`);
      foundBuildDir = true;
    } else {
      console.log(`\n❌ index.html not found in ${buildDir}`);
    }
    
    console.log('\n---\n');
  }
}

if (!foundBuildDir) {
  console.log('❌ No build directories found with index.html. Please run the build process.');
  console.log('   Try running: npm run build');
} else {
  console.log('✅ Build directories verified successfully.');
}

// Check server build output
const serverBuild = path.resolve(process.cwd(), 'dist', 'index.js');
if (fs.existsSync(serverBuild)) {
  console.log(`\n✅ Found server build output: ${serverBuild}`);
} else {
  console.log(`\n❌ Server build output not found at: ${serverBuild}`);
  console.log('   This may cause issues when running in production mode.');
}