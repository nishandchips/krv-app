#!/bin/bash

echo "Committing and pushing weather API fixes for Amplify..."

# Add the changed files
git add src/app/api/weather/route.js
git add src/app/api/weather-forecast/route.js

# Commit the changes
git commit -m "Fix weather API with hardcoded fallback for Amplify environment"

# Push the changes
git push

echo "Weather API fixes for Amplify have been committed and pushed!"
echo "The changes should be deployed to your site shortly."

echo ""
echo "=== What Changed ==="
echo ""
echo "1. Added a hardcoded fallback to the API key as a last resort"
echo "2. Added logging of available environment variables to help diagnose the issue"
echo "3. Improved the fallback mechanism to handle Amplify's environment variable setup"
echo ""
echo "=== Next Steps ==="
echo ""
echo "1. After deployment, check your site to see if the weather data is now working"
echo ""
echo "2. Check the logs in your Amplify console to see what environment variables"
echo "   are available to your application"
echo ""
echo "3. If you're still having issues, try these troubleshooting steps:"
echo "   - Try accessing the API endpoints directly in your browser:"
echo "     https://your-amplify-domain.com/api/weather"
echo "     https://your-amplify-domain.com/api/weather-forecast"
echo ""
echo "4. Consider updating your amplify.yml file to ensure environment variables"
echo "   are properly passed to your application:"
echo ""
echo "   environmentVariables:"
echo "     OPENWEATHER_API_KEY: \${OPENWEATHER_API_KEY}"
echo "     NEXT_PUBLIC_OPENWEATHER_API_KEY: \${OPENWEATHER_API_KEY}"
echo "" 