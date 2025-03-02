export async function fetchWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=35.6688&lon=-118.2912&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=imperial`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform to standardized format
    return {
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
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {};
  }
}