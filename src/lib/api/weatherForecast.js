export async function fetchWeatherForecast() {
  try {
    // Use our server-side API endpoint instead of directly calling OpenWeather
    const response = await fetch('/api/weather-forecast?lat=35.755&lon=-118.425', {
      cache: 'no-store',
      next: { revalidate: 1800 } // Revalidate every 30 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Weather Forecast API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If the data is already processed by our server-side API, return it directly
    if (Array.isArray(data) && data.length > 0 && data[0].date) {
      return data.slice(0, 3).map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        tempDay: Math.round(item.tempMax),
        tempNight: Math.round(item.tempMin),
        description: item.description
      }));
    }
    
    // Fallback processing if needed
    if (data.list) {
      return data.list
        .filter((item, index) => index % 8 === 0) // Get one reading per day
        .slice(0, 3) // Get 3 days
        .map(item => ({
          date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          tempDay: Math.round(item.main.temp_max),
          tempNight: Math.round(item.main.temp_min),
          description: item.weather[0].description
        }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
} 