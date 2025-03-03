#!/usr/bin/env node

/**
 * Script to check if the background image is properly included in the build
 * Usage: node check-image.js
 */

const fs = require('fs');
const path = require('path');

// Define paths
const sourcePath = path.join(process.cwd(), 'public', 'images', 'kern-river-background.jpg');
const buildPath = path.join(process.cwd(), '.next', 'static', 'media');

console.log('Checking for background image in the build...');

// Check if the source image exists
if (!fs.existsSync(sourcePath)) {
  console.error('❌ Source image not found at:', sourcePath);
  console.error('   Please add the image to the public/images directory.');
  process.exit(1);
}

console.log('✅ Source image found at:', sourcePath);

// Get the file size of the source image
const sourceStats = fs.statSync(sourcePath);
console.log(`   Size: ${(sourceStats.size / 1024 / 1024).toFixed(2)} MB`);

// Check if the build directory exists
if (!fs.existsSync(buildPath)) {
  console.warn('⚠️ Build directory not found. Have you run "npm run build" yet?');
  process.exit(0);
}

// Check if the image is included in the build
let imageFound = false;
let buildImagePath = '';

try {
  // List all files in the build directory
  const files = fs.readdirSync(buildPath);
  
  // Look for image files
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
      const filePath = path.join(buildPath, file);
      const stats = fs.statSync(filePath);
      
      // If the file size is similar to the source image, it's likely the same image
      if (Math.abs(stats.size - sourceStats.size) < 1024 * 100) { // Within 100KB
        imageFound = true;
        buildImagePath = filePath;
        break;
      }
    }
  }
} catch (error) {
  console.error('Error checking build directory:', error.message);
}

if (imageFound) {
  console.log('✅ Image found in build at:', buildImagePath);
  console.log('   Your image should be properly included in the deployment.');
} else {
  console.warn('⚠️ Image not found in build directory.');
  console.warn('   This might be normal if Next.js is handling static assets differently.');
  console.warn('   Check your deployment to see if the image is visible.');
}

console.log('\nNext steps:');
console.log('1. Run "npm run build" to build your application');
console.log('2. Commit and push your changes to GitHub');
console.log('3. Check your deployed site to see if the image is visible');
console.log('4. If the image is not visible, check your hosting platform\'s build logs');

console.log('\nDone!'); 