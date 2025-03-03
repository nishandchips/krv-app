#!/bin/bash

# Script to build and prepare the application for deployment
# Usage: ./scripts/deploy.sh

echo "Kern River Valley App Deployment Helper"
echo "--------------------------------------"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: This script must be run from the project root directory."
  echo "Please navigate to the project root and try again."
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Verify that the public directory is included in the build
echo "Verifying public directory..."
if [ -d ".next/static" ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed or incomplete. Check for errors above."
  exit 1
fi

# Check for the background image
echo "Checking for background image..."
if [ -f "public/images/kern-river-background.jpg" ]; then
  echo "✅ Background image found!"
else
  echo "⚠️ Warning: Background image not found at public/images/kern-river-background.jpg"
  echo "   The application will use the fallback gradient background."
fi

# Prepare for deployment
echo ""
echo "Your application is ready for deployment!"
echo ""
echo "To deploy to your hosting platform:"
echo ""
echo "1. Commit your changes using Git:"
echo "   git add ."
echo "   git commit -m \"Prepare for deployment\""
echo "   git push"
echo ""
echo "2. Your hosting platform should automatically detect the changes and start a new build."
echo ""
echo "3. Check your hosting platform's dashboard for build status and any errors."
echo ""
echo "Done!" 