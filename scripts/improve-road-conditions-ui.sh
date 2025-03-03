#!/bin/bash

echo "Committing road conditions UI improvements..."

# Add the modified files
git add src/components/RoadStatusIndicators.js
git add src/components/ClosuresList.js
git add src/components/cards/RoadClosuresCard.js

# Commit the changes
git commit -m "Improve road conditions UI: align indicators and fix text truncation"

# Push the changes
git push

echo "Road conditions UI improvements committed and pushed!"
echo "The changes should be deployed to your site shortly."
echo ""
echo "Changes made:"
echo "1. Fixed alignment of road status indicators"
echo "2. Added proper spacing for 'Conditions Apply' text"
echo "3. Fixed text truncation in road conditions display"
echo "4. Improved card layout to handle overflow properly" 