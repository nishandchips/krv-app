#!/bin/bash

echo "Committing and pushing weather API fixes..."

# Add the changed files
git add src/app/api/weather/route.js
git add src/app/api/weather-forecast/route.js
git add src/lib/weather.js
git add src/lib/weatherForecast.js

# Commit the changes
git commit -m "Fix weather API with improved error handling and debugging"

# Push the changes
git push

echo "Weather API fixes have been committed and pushed!"
echo "The changes should be deployed to your site shortly."

echo ""
echo "=== Next Steps ==="
echo ""
echo "1. Run the diagnostic tools to verify your API configuration:"
echo "   npm run check-weather    # Test the OpenWeather API directly"
echo "   npm run check-amplify    # Check your Amplify configuration"
echo ""
echo "2. After deployment, check the logs in your Amplify console to see"
echo "   the debugging output from the weather API calls."
echo ""
echo "3. If you're still having issues, try these troubleshooting steps:"
echo "   - Verify your API key is correct and active"
echo "   - Check if you've exceeded your API quota or rate limits"
echo "   - Make sure your Amplify environment variables are set correctly"
echo "   - Try accessing the API endpoints directly in your browser:"
echo "     https://your-amplify-domain.com/api/weather"
echo "     https://your-amplify-domain.com/api/weather-forecast"
echo "" 