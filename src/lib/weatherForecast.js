export async function fetchWeatherForecast(location = null) {
  try {
    console.log('Client: Fetching weather forecast from internal API route');
    
    // Construct API URL with location parameters if provided
    let url = '/api/weather-forecast';
    if (location) {
      url += `?lat=${location.lat}&lon=${location.lon}`;
    }
    
    // Call our internal API route
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Client: Weather forecast API response status:', response.status);
    
    if (!response.ok) {
      // Try to get more detailed error information
      try {
        const errorData = await response.json();
        console.error('Client: Weather forecast API error details:', errorData);
        throw new Error(`Weather forecast API error: ${errorData.error || response.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    // Check if the response contains an error
    if (data.error) {
      console.error('Client: Weather forecast API returned error:', data.error);
      throw new Error(data.error);
    }
    
    // Validate that we have the required data
    if (!Array.isArray(data)) {
      console.error('Client: Weather forecast API returned invalid data (not an array)');
      throw new Error('Invalid weather forecast data received');
    }
    
    console.log('Client: Weather forecast data received, count:', data.length);
    
    return data;
  } catch (error) {
    console.error('Client: Error fetching weather forecast:', error);
    // Return empty array to indicate error - the UI will show an error message
    return [];
  }
}