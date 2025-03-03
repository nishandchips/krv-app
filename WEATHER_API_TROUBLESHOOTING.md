# Weather API Troubleshooting Guide

This guide will help you diagnose and fix issues with the weather data in your Kern River Valley App deployment.

## Diagnostic Tools

We've added several diagnostic tools to help troubleshoot weather API issues:

1. **Weather API Tester**
   ```
   npm run check-weather
   ```
   This tool tests your OpenWeather API key directly against the OpenWeather API to verify it's working correctly.

2. **Amplify Configuration Checker**
   ```
   npm run check-amplify
   ```
   This tool checks your Amplify configuration and environment variables to ensure they're set up correctly.

## Common Issues and Solutions

### 1. Weather Data Works Locally But Not in Production

This is the most common issue and usually happens because:

- **Environment Variables**: The API key is available locally but not in production
- **CORS Issues**: API requests are blocked in production
- **Rate Limiting**: You've exceeded your API quota in production

#### Solution:

1. **Check Environment Variables**:
   - Make sure `OPENWEATHER_API_KEY` is set in your Amplify console:
     - Go to AWS Amplify Console > Your App > Environment Variables
     - Add `OPENWEATHER_API_KEY` with your API key value

2. **Verify API Key**:
   - Run `npm run check-weather` to test your API key directly
   - If it fails, your API key might be invalid or you've exceeded your quota

3. **Check Amplify Logs**:
   - After deploying, check the logs in your Amplify console
   - Look for the debug logs we added (e.g., "Weather API: Using API key:")
   - See if there are any error messages

### 2. "API Key Not Configured" Error

This error occurs when the application can't find your OpenWeather API key.

#### Solution:

1. **Check Local Environment**:
   - Make sure `.env.local` contains `NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key`

2. **Check Production Environment**:
   - Make sure `OPENWEATHER_API_KEY` is set in your Amplify console
   - The key should be the same as your local `NEXT_PUBLIC_OPENWEATHER_API_KEY`

3. **Check amplify.yml**:
   - Make sure your `amplify.yml` file includes:
     ```yaml
     environmentVariables:
       OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
     ```

### 3. Weather Data Shows Fallback Values

If you're seeing default values like "75°F" and "Sunny", the API request is failing and falling back to default data.

#### Solution:

1. **Check the Console Logs**:
   - Open your browser's developer tools (F12)
   - Look for error messages in the console
   - Look for our debug logs (e.g., "Client: Weather API response status:")

2. **Check Network Requests**:
   - In your browser's developer tools, go to the Network tab
   - Look for requests to `/api/weather` and `/api/weather-forecast`
   - Check the response status and content

3. **Try Direct API Access**:
   - Try accessing the API endpoints directly in your browser:
     - `https://your-amplify-domain.com/api/weather`
     - `https://your-amplify-domain.com/api/weather-forecast`
   - Check if they return valid JSON or error messages

### 4. "HTTP Error" or Network Issues

If you're seeing HTTP errors or network issues, there might be connectivity problems.

#### Solution:

1. **Check Your Internet Connection**:
   - Make sure you have a stable internet connection
   - Try from a different network or device

2. **Check for CORS Issues**:
   - Look for CORS errors in your browser's console
   - Our implementation should avoid CORS issues by using internal API routes

3. **Check for Firewall or Proxy Issues**:
   - Some networks block API requests to certain domains
   - Try from a different network if possible

## Advanced Troubleshooting

### Checking API Requests in Production

To see exactly what's happening with your API requests in production:

1. **Enable Browser Developer Tools**:
   - Open your deployed site
   - Open developer tools (F12)
   - Go to the Network tab
   - Refresh the page

2. **Look for These Requests**:
   - `/api/weather` - Current weather data
   - `/api/weather-forecast` - 5-day forecast data

3. **Analyze the Responses**:
   - Check the status code (should be 200)
   - Check the response body for valid data
   - Look for any error messages

### Modifying the Debug Logs

If you need more detailed debugging:

1. **Add More Console Logs**:
   - Edit the files we modified to add more detailed logs
   - Focus on areas where you suspect issues

2. **Check Server-Side Logs**:
   - In your Amplify console, check the build and function logs
   - Look for our debug messages and any errors

## Contacting OpenWeather Support

If you've verified your API key is correct but still having issues:

1. **Check API Status**:
   - Visit [OpenWeather Status](https://status.openweathermap.org/) to check if there are any service disruptions

2. **Contact OpenWeather Support**:
   - If you believe there's an issue with your API key or account
   - Visit [OpenWeather Support](https://openweathermap.org/contact-us)

## Need More Help?

If you're still having issues after trying these solutions:

1. **Check for Updates**:
   - Make sure you have the latest version of the code
   - Pull the latest changes from the repository

2. **Review the Code**:
   - Check the implementation in:
     - `src/app/api/weather/route.js`
     - `src/app/api/weather-forecast/route.js`
     - `src/lib/weather.js`
     - `src/lib/weatherForecast.js`

3. **Consider Alternative APIs**:
   - If OpenWeather continues to be problematic, consider alternatives like:
     - [WeatherAPI](https://www.weatherapi.com/)
     - [AccuWeather](https://developer.accuweather.com/)
     - [Visual Crossing](https://www.visualcrossing.com/weather-api) 