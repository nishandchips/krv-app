export async function fetchWeatherForecast() {
  try {
    // OpenWeather OneCall API 3.0 requires paid subscription, switching to free 5-day forecast API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=35.6688&lon=-118.2912&units=imperial&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
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
    
    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return [];
  }
}