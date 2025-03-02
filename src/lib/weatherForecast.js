export async function fetchWeatherForecast() {
  try {
    // Call our internal API route instead of external API directly
    const response = await fetch('/api/weather-forecast', { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    // Return fallback data if API call fails
    const today = new Date();
    return [
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
  }
}