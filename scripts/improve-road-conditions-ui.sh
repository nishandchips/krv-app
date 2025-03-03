#!/bin/bash

echo "Committing road conditions UI improvements..."

# Add the modified files
git add src/components/RoadStatusIndicators.js
git add src/components/ClosuresList.js
git add src/components/cards/RoadClosuresCard.js

# Commit the changes
git commit -m "Fix road conditions UI: align status lights and prevent text truncation"

# Push the changes
git push

echo "Road conditions UI improvements committed and pushed!"
echo "The changes should be deployed to your site shortly."
echo ""
echo "Changes made:"
echo "1. Fixed vertical alignment of status lights with fixed-height containers"
echo "2. Improved text display in condition boxes with better overflow handling"
echo "3. Increased padding in condition boxes for better readability"
echo "4. Adjusted card spacing to provide more room for content" 