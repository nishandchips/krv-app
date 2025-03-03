#!/bin/bash

echo "Committing road conditions fixes..."

# Add the modified files
git add src/lib/caltrans.js
git add src/app/api/road-conditions/route.js

# Commit the changes
git commit -m "Fix road conditions with server-side API route to avoid CORS issues"

# Push the changes
git push

echo "Road conditions fixes committed and pushed!"
echo "The changes should be deployed to your site shortly." 