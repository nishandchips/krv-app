#!/usr/bin/env node

/**
 * Simple utility to strip EXIF data from images - Windows version
 * Usage: node strip-exif-windows.js <input-image> [output-image]
 * If output-image is not provided, it will overwrite the input image
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.error('Error: The "sharp" package is required but not installed.');
  console.error('Please install it by running: npm install sharp');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Please provide an input image path.');
  console.error('Usage: node strip-exif-windows.js <input-image> [output-image]');
  process.exit(1);
}

const inputPath = args[0];
const outputPath = args.length > 1 ? args[1] : inputPath;

console.log(`Processing: ${inputPath}`);
console.log(`Output: ${outputPath}`);

// Validate input file exists
try {
  fs.accessSync(inputPath, fs.constants.F_OK);
} catch (err) {
  console.error(`Error: Input file "${inputPath}" does not exist.`);
  process.exit(1);
}

// Get file extension
const ext = path.extname(inputPath).toLowerCase();
const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.gif'];

if (!supportedFormats.includes(ext)) {
  console.error(`Error: Unsupported file format "${ext}". Supported formats: ${supportedFormats.join(', ')}`);
  process.exit(1);
}

// Strip EXIF data
sharp(inputPath)
  .withMetadata({ exif: {} }) // This removes all EXIF data
  .toBuffer()
  .then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ EXIF data successfully stripped!');
  })
  .catch(err => {
    console.error('Error processing image:', err);
    process.exit(1);
  }); 