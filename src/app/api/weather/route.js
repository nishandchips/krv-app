export async function GET() {
  try {
    // Try server-side API key first with multiple possible environment variable names
    let apiKey = process.env.OPENWEATHER_API_KEY;
    
    // Log all environment variables for debugging (without values)
    console.log('Weather API: Available environment variables:', 
      Object.keys(process.env)
        .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN'))
        .join(', ')
    );
    
    // Check if we need to fall back to the public key
    let usingPublicKey = false;
    
    console.log('Weather API: Using server-side API key:', apiKey ? 'Server API key is set' : 'Server API key is missing');
    
    // If server-side key is missing, fall back to public key
    if (!apiKey) {
      apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      usingPublicKey = true;
      console.log('Weather API: Falling back to public API key:', apiKey ? 'Public API key is set' : 'Public API key is missing');
    }
    
    // If still no API key, use the hardcoded key from the Amplify environment
    if (!apiKey) {
      // This is the key from your Amplify environment variables
      apiKey = 'afca1dbf0f148b90d292e7ac2da2e959';
      console.log('Weather API: Falling back to hardcoded API key as last resort');
    }
    
    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured');
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=35.6688&lon=-118.2912&appid=${apiKey}&units=imperial`;
    console.log('Weather API: Fetching from URL:', url.replace(apiKey, 'API_KEY_HIDDEN'), usingPublicKey ? '(using public key)' : '(using server key)');
    
    const response = await fetch(
      url,
      { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    console.log('Weather API: Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Weather API: Received data:', JSON.stringify(data).substring(0, 100) + '...');
    
    // Transform to standardized format
    const processedData = {
      temp: data.main?.temp,
      tempMin: data.main?.temp_min,
      tempMax: data.main?.temp_max,
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed,
      windDirection: data.wind?.deg,
      pressure: data.main?.pressure,
      description: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon,
      cityName: data.name,
      countryCode: data.sys?.country,
      shortForecast: `High: ${Math.round(data.main?.temp_max)}°F, Low: ${Math.round(data.main?.temp_min)}°F`,
      timestamp: new Date().toISOString()
    };
    
    console.log('Weather API: Processed data:', JSON.stringify(processedData).substring(0, 100) + '...');
    
    return Response.json(processedData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return fallback data with error status
    const fallbackData = {
      temp: 75,
      tempMin: 65,
      tempMax: 85,
      humidity: 30,
      windSpeed: 5,
      windDirection: 180,
      pressure: 1015,
      description: "Sunny",
      icon: "01d",
      cityName: "Kernville",
      countryCode: "US",
      shortForecast: "High: 85°F, Low: 65°F",
      timestamp: new Date().toISOString(),
      error: error.message
    };
    
    console.log('Weather API: Returning fallback data due to error:', error.message);
    
    return Response.json(
      fallbackData,
      { status: 200 } // Still return 200 to prevent client errors
    );
  }
} 