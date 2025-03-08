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
      // Try to get more detailed error information
      try {
        const errorData = await response.json();
        console.error('Client: Weather API error details:', errorData);
        throw new Error(`Weather API error: ${errorData.error || response.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('Client: Weather data received:', JSON.stringify(data).substring(0, 100) + '...');
    
    // Check if the response contains an error
    if (data.error) {
      console.error('Client: Weather API returned error:', data.error);
      throw new Error(data.error);
    }
    
    // Check if the data is nested or direct
    const weatherData = data.weather ? data.weather : data;
    
    // Validate that we have the required data
    if (weatherData.temp === undefined) {
      console.error('Client: Weather API returned invalid data (missing temp):', JSON.stringify(data));
      throw new Error('Invalid weather data received');
    }
    
    // Add location name to the data if provided
    if (location) {
      weatherData.locationName = location.name;
    }
    
    return weatherData;
  } catch (error) {
    console.error('Client: Error fetching weather data:', error);
    // Return null to indicate error - the UI will show an error message
    return null;
  }
}