export async function GET() {
  try {
    // API key is only accessible on the server
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured');
    }
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=35.6688&lon=-118.2912&appid=${apiKey}&units=imperial`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
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
    
    return Response.json(processedData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return fallback data with error status
    return Response.json(
      {
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
      },
      { status: 200 } // Still return 200 to prevent client errors
    );
  }
} 