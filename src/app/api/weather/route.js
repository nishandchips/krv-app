export async function GET(request) {
  try {
    // Get location from query parameters
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || '35.6688'; // Default to Lake Isabella
    const lon = searchParams.get('lon') || '-118.2912';
    
    // Try to get the API key from environment variables
    // First try the server-side key, then fall back to the public key
    let apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    
    // Log all environment variables for debugging (without values)
    console.log('Weather API: Available environment variables:', 
      Object.keys(process.env)
        .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN'))
        .join(', ')
    );
    
    console.log('Weather API: API key status:', apiKey ? 'API key is set' : 'API key is missing');
    
    // If no API key, provide a helpful error message based on environment
    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Weather API: No API key found in local development. Please set OPENWEATHER_API_KEY in your .env.local file.');
        throw new Error('OpenWeather API key is not configured. Please create or update your .env.local file with OPENWEATHER_API_KEY=your_api_key_here');
      } else {
        console.error('Weather API: OpenWeather API key is not configured in production environment.');
        throw new Error('OpenWeather API key is not configured. Please check that OPENWEATHER_API_KEY is set in your AWS Amplify environment variables and that your amplify.yml file is properly configured to pass environment variables to Next.js API routes.');
      }
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    console.log('Weather API: Fetching from URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
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
    
    // Check if the data has the expected structure
    if (!data.main || !data.weather || !data.weather.length) {
      console.error('Weather API: Received data is missing required fields:', JSON.stringify(data));
      throw new Error('Weather API returned incomplete data');
    }
    
    // Log the specific fields we need
    console.log('Weather API: Key fields:', {
      temp: data.main.temp,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      description: data.weather[0]?.description,
      icon: data.weather[0]?.icon
    });
    
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
    
    // Validate the processed data
    if (processedData.temp === undefined) {
      console.error('Weather API: Processed data is missing temperature:', JSON.stringify(processedData));
      throw new Error('Weather API processed data is missing temperature');
    }
    
    console.log('Weather API: Processed data:', JSON.stringify(processedData).substring(0, 100) + '...');
    
    return Response.json(processedData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return a proper error response
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 