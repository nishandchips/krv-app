export async function fetchWeather() {
  try {
    console.log('Client: Fetching weather data from internal API route');
    // Call our internal API route instead of external API directly
    const response = await fetch('/api/weather', { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Client: Weather API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Client: Weather data received:', JSON.stringify(data).substring(0, 100) + '...');
    
    if (data.error) {
      console.warn('Client: Weather API returned error:', data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Client: Error fetching weather data:', error);
    // Return fallback data if API call fails
    return {
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
      timestamp: new Date().toISOString()
    };
  }
}