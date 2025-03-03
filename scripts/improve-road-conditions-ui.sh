#!/bin/bash

echo "Starting road conditions UI improvement commit process..."
echo ""
echo "Changes made:"
echo "1. Implemented fixed-height containers for perfect vertical alignment"
echo "2. Added fixed width to highway columns to ensure consistent sizing"
echo "3. Improved text display with break-words and removed truncation"
echo "4. Changed overflow handling to visible to ensure all content displays"
echo ""

# Navigate to project root (if script is in scripts/ directory)
cd "$(dirname "$0")/.." || exit

# Add modified files
git add src/components/RoadStatusIndicators.js src/components/ClosuresList.js src/components/cards/RoadClosuresCard.js

# Commit and push
git commit -m "Fix road conditions UI: implement fixed-height bounding boxes for perfect alignment"
git push

echo ""
echo "Process completed. Please check for any errors above."
echo "Press Enter to continue..."
read -r 