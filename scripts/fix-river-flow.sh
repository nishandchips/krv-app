#!/bin/bash

# Script to commit and push the river flow fixes
# Usage: ./scripts/fix-river-flow.sh

echo "Committing and pushing river flow fixes..."

# Navigate to the project directory if needed
# cd /mnt/c/Users/nadel/Documents/krv-app

# Add the changed files
git add src/app/api/river-flow/route.js

# Commit the changes
git commit -m "Fix North Fork flow data parsing and timestamp handling"

# Push the changes
git push

echo ""
echo "Done! The fixes have been pushed to your repository."
echo "The changes should be deployed to your site shortly." 