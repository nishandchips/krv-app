export async function fetchWeatherForecast() {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=35.755&lon=-118.425&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=imperial`);
    const data = await response.json();
    
    // Process forecast data
    const forecast = data.list
      .filter((item, index) => index % 8 === 0) // Get one reading per day
      .slice(0, 3) // Get 3 days
      .map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        tempDay: Math.round(item.main.temp_max),
        tempNight: Math.round(item.main.temp_min),
        description: item.weather[0].description
      }));
    
    return forecast;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
} 