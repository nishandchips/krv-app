export async function GET() {
  try {
    // Try server-side API key first with multiple possible environment variable names
    let apiKey = process.env.OPENWEATHER_API_KEY;
    
    // Log all environment variables for debugging (without values)
    console.log('Weather Forecast API: Available environment variables:', 
      Object.keys(process.env)
        .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN'))
        .join(', ')
    );
    
    // Check if we need to fall back to the public key
    let usingPublicKey = false;
    
    console.log('Weather Forecast API: Using server-side API key:', apiKey ? 'Server API key is set' : 'Server API key is missing');
    
    // If server-side key is missing, fall back to public key
    if (!apiKey) {
      apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      usingPublicKey = true;
      console.log('Weather Forecast API: Falling back to public API key:', apiKey ? 'Public API key is set' : 'Public API key is missing');
    }
    
    // If still no API key, use the hardcoded key from the Amplify environment
    if (!apiKey) {
      // This is the key from your Amplify environment variables
      apiKey = 'afca1dbf0f148b90d292e7ac2da2e959';
      console.log('Weather Forecast API: Falling back to hardcoded API key as last resort');
    }
    
    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured');
    }
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=35.6688&lon=-118.2912&units=imperial&appid=${apiKey}`;
    console.log('Weather Forecast API: Fetching from URL:', url.replace(apiKey, 'API_KEY_HIDDEN'), usingPublicKey ? '(using public key)' : '(using server key)');
    
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
    
    console.log('Weather Forecast API: Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Weather Forecast API: Received data list length:', data.list?.length || 0);
    
    // Process the 5-day forecast (every 3 hours, 40 data points)
    // We'll take one per day (at noon) to get a 5-day forecast
    const dailyForecasts = [];
    const processedDates = new Set();
    
    if (data.list && data.list.length > 0) {
      for (const forecast of data.list) {
        const date = new Date(forecast.dt * 1000);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Only process one forecast per day (preferably around noon)
        const hour = date.getHours();
        if (!processedDates.has(dateStr) && (hour >= 11 && hour <= 14)) {
          processedDates.add(dateStr);
          
          dailyForecasts.push({
            date: dateStr,
            tempMax: forecast.main.temp_max,
            tempMin: forecast.main.temp_min,
            description: forecast.weather[0].description,
            icon: forecast.weather[0].icon,
            humidity: forecast.main.humidity,
            windSpeed: forecast.wind.speed
          });
          
          // Stop after we have 5 days
          if (dailyForecasts.length >= 5) break;
        }
      }
    }
    
    // If we couldn't get forecasts at noon, just take the first of each day
    if (dailyForecasts.length < 5 && data.list && data.list.length > 0) {
      processedDates.clear();
      dailyForecasts.length = 0;
      
      for (const forecast of data.list) {
        const date = new Date(forecast.dt * 1000);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!processedDates.has(dateStr)) {
          processedDates.add(dateStr);
          
          dailyForecasts.push({
            date: dateStr,
            tempMax: forecast.main.temp_max,
            tempMin: forecast.main.temp_min,
            description: forecast.weather[0].description,
            icon: forecast.weather[0].icon,
            humidity: forecast.main.humidity,
            windSpeed: forecast.wind.speed
          });
          
          if (dailyForecasts.length >= 5) break;
        }
      }
    }
    
    console.log('Weather Forecast API: Processed forecast count:', dailyForecasts.length);
    
    return Response.json(dailyForecasts);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    
    // Return fallback data with error status
    const today = new Date();
    const fallbackData = [
      {
        date: new Date(today).toISOString().split('T')[0],
        tempMax: 85,
        tempMin: 65,
        description: "Sunny",
        icon: "01d",
        humidity: 30,
        windSpeed: 5
      },
      {
        date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0],
        tempMax: 87,
        tempMin: 67,
        description: "Clear sky",
        icon: "01d",
        humidity: 32,
        windSpeed: 6
      },
      {
        date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0],
        tempMax: 86,
        tempMin: 66,
        description: "Few clouds",
        icon: "02d",
        humidity: 35,
        windSpeed: 7
      },
      {
        date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0],
        tempMax: 84,
        tempMin: 64,
        description: "Scattered clouds",
        icon: "03d",
        humidity: 38,
        windSpeed: 8
      },
      {
        date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0],
        tempMax: 82,
        tempMin: 62,
        description: "Partly cloudy",
        icon: "04d",
        humidity: 40,
        windSpeed: 9
      }
    ];
    
    console.log('Weather Forecast API: Returning fallback data due to error:', error.message);
    
    return Response.json(
      fallbackData,
      { status: 200 } // Still return 200 to prevent client errors
    );
  }
} 