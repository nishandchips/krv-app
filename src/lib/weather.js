export async function fetchWeather(location = null) {
  try {
    console.log('Client: Fetching weather data from internal API route');
    
    // Construct API URL with location parameters if provided
    let url = '/api/weather';
    if (location) {
      url += `?lat=${location.lat}&lon=${location.lon}`;
    }
    
    // Call our internal API route instead of external API directly
    const response = await fetch(url, { 
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
    
    // Add location name to the data if provided
    if (location) {
      data.locationName = location.name;
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
      cityName: location?.name || "Lake Isabella",
      countryCode: "US",
      shortForecast: "High: 85°F, Low: 65°F",
      timestamp: new Date().toISOString(),
      locationName: location?.name || "Lake Isabella"
    };
  }
}