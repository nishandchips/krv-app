export async function fetchWeather() {
  try {
    // Call our internal API route instead of external API directly
    const response = await fetch('/api/weather', { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
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