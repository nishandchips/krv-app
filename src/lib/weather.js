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
        throw new Error(`Weather API error: ${errorData.message || response.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
      }
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
    // Return null to indicate error - the UI will show an error message
    return null;
  }
}