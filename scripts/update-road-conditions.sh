#!/bin/bash

echo "Committing and pushing road conditions feature updates..."

# Add the changed files
git add src/components/RoadStatusIndicators.js
git add src/components/ClosuresList.js
git add src/components/cards/RoadClosuresCard.js
git add src/lib/api/caltrans.js
git add src/hooks/useDataFetching.js

# Commit the changes
git commit -m "Add road conditions to road information card"

# Push the changes
git push

echo "Road conditions feature updates have been committed and pushed!"
echo "The changes should be deployed to your site shortly."

echo ""
echo "=== What Changed ==="
echo ""
echo "1. Added road conditions information to the road conditions card"
echo "2. Updated the Caltrans API to fetch various road conditions for Hwy 155 and Hwy 178"
echo "3. Created new components to display both closures and road conditions"
echo "4. Renamed 'Road Closures' to 'Road Conditions' to better reflect the content"
echo "5. Made the implementation flexible to handle various types of road conditions"
echo ""
echo "=== Next Steps ==="
echo ""
echo "1. After deployment, check your site to see if the road conditions are displayed"
echo "2. When conditions are active, they will appear with an amber 'Conditions Apply' indicator"
echo "3. The conditions will appear in a separate 'Current Conditions' section below any closures"
echo "4. The system now detects various conditions including chains, snow, ice, fog, construction, etc."
echo "" 