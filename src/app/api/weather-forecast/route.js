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
    console.log('Weather Forecast API: Available environment variables:', 
      Object.keys(process.env)
        .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN'))
        .join(', ')
    );
    
    console.log('Weather Forecast API: API key status:', apiKey ? 'API key is set' : 'API key is missing');
    
    // If no API key, provide a helpful error message based on environment
    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Weather Forecast API: No API key found in local development. Please set OPENWEATHER_API_KEY in your .env.local file.');
        throw new Error('OpenWeather API key is not configured. Please create or update your .env.local file with OPENWEATHER_API_KEY=your_api_key_here');
      } else {
        console.error('Weather Forecast API: OpenWeather API key is not configured in production environment.');
        throw new Error('OpenWeather API key is not configured. Please check that OPENWEATHER_API_KEY is set in your AWS Amplify environment variables and that your amplify.yml file is properly configured to pass environment variables to Next.js API routes.');
      }
    }
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    console.log('Weather Forecast API: Fetching from URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
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
    
    // Process the 5-day forecast - properly calculate daily min/max temps
    const dailyForecasts = [];
    const forecastsByDay = {};
    
    if (data.list && data.list.length > 0) {
      // Group forecasts by date
      for (const forecast of data.list) {
        const date = new Date(forecast.dt * 1000);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!forecastsByDay[dateStr]) {
          forecastsByDay[dateStr] = {
            forecasts: [],
            tempMax: -Infinity,
            tempMin: Infinity,
            icons: {},
            descriptions: {}
          };
        }
        
        // Track all forecasts for this day
        forecastsByDay[dateStr].forecasts.push(forecast);
        
        // Update min/max temperatures
        if (forecast.main.temp_max > forecastsByDay[dateStr].tempMax) {
          forecastsByDay[dateStr].tempMax = forecast.main.temp_max;
        }
        if (forecast.main.temp_min < forecastsByDay[dateStr].tempMin) {
          forecastsByDay[dateStr].tempMin = forecast.main.temp_min;
        }
        
        // Count occurrences of each icon and description to find the most common
        const icon = forecast.weather[0].icon;
        const description = forecast.weather[0].description;
        
        forecastsByDay[dateStr].icons[icon] = (forecastsByDay[dateStr].icons[icon] || 0) + 1;
        forecastsByDay[dateStr].descriptions[description] = 
          (forecastsByDay[dateStr].descriptions[description] || 0) + 1;
      }
      
      // Convert grouped data to daily forecasts, finding most common weather condition
      const dates = Object.keys(forecastsByDay).sort();
      
      for (const dateStr of dates) {
        const dayData = forecastsByDay[dateStr];
        
        // Find most common icon and description
        let mostCommonIcon = null;
        let maxIconCount = 0;
        for (const [icon, count] of Object.entries(dayData.icons)) {
          if (count > maxIconCount) {
            maxIconCount = count;
            mostCommonIcon = icon;
          }
        }
        
        let mostCommonDescription = null;
        let maxDescCount = 0;
        for (const [desc, count] of Object.entries(dayData.descriptions)) {
          if (count > maxDescCount) {
            maxDescCount = count;
            mostCommonDescription = desc;
          }
        }
        
        // Get a midday forecast for other values if available
        const middayForecast = dayData.forecasts.find(f => {
          const hour = new Date(f.dt * 1000).getHours();
          return hour >= 10 && hour <= 14;
        }) || dayData.forecasts[0];
        
        dailyForecasts.push({
          date: dateStr,
          tempMax: dayData.tempMax,
          tempMin: dayData.tempMin,
          description: mostCommonDescription,
          icon: mostCommonIcon,
          humidity: middayForecast.main.humidity,
          windSpeed: middayForecast.wind.speed
        });
        
        // Stop after we have 5 days
        if (dailyForecasts.length >= 5) break;
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