export async function fetchWeather() {
  try {
    // Use our server-side API endpoint instead of directly calling OpenWeather
    const response = await fetch('/api/weather?lat=35.755&lon=-118.425', {
      cache: 'no-store',
      next: { revalidate: 1800 } // Revalidate every 30 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
} 