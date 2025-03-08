#!/usr/bin/env node

/**
 * This script generates PNG icons from the SVG favicon for the KRV.APP
 * 
 * To use this script:
 * 1. Install sharp: npm install sharp
 * 2. Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512];
const svgPath = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public');

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

console.log(`${colors.bold}${colors.blue}=== Generating KRV.APP Icons ===${colors.reset}\n`);

// Check if the SVG file exists
if (!fs.existsSync(svgPath)) {
  console.error(`${colors.red}Error: SVG file not found at ${svgPath}${colors.reset}`);
  process.exit(1);
}

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the SVG file
const svgBuffer = fs.readFileSync(svgPath);

// Generate icons for each size
async function generateIcons() {
  try {
    // Generate favicon.ico (multi-size icon)
    const icoSizes = [16, 32, 48];
    const icoBuffers = await Promise.all(
      icoSizes.map(size => 
        sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );
    
    console.log(`${colors.yellow}Note: favicon.ico generation requires the 'to-ico' package.${colors.reset}`);
    console.log(`${colors.yellow}Please install it with: npm install to-ico${colors.reset}`);
    console.log(`${colors.yellow}Then use the buffers to create the .ico file.${colors.reset}\n`);
    
    // Generate PNG icons
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`${colors.green}✓ Generated:${colors.reset} icon-${size}.png`);
    }
    
    // Generate apple-touch-icon.png (special size for iOS)
    const appleTouchIconPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(appleTouchIconPath);
    
    console.log(`${colors.green}✓ Generated:${colors.reset} apple-touch-icon.png`);
    
    console.log(`\n${colors.bold}${colors.green}All icons generated successfully!${colors.reset}`);
    console.log(`${colors.bold}Don't forget to update your HTML to include these icons.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error generating icons:${colors.reset}`, error);
    process.exit(1);
  }
}

generateIcons(); 