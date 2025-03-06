export async function fetchRoadClosures() {
  try {
    console.log('Client: Fetching road conditions from internal API route');
    
    // Generate timestamp for cache busting
    const timestamp = Date.now();
    
    // Call our internal API route instead of external API directly with cache busting
    const response = await fetch(`/api/road-conditions?_nocache=${timestamp}`, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Client: Road conditions API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Client: Road conditions data received:', data);
    console.log('Client: Timestamp of data:', data.timestamp);
    
    return {
      roadClosures: data.roadClosures || [],
      roadConditions: data.roadConditions || [],
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error fetching road data:', error);
    return {
      roadClosures: [],
      roadConditions: []
    };
  }
}

// Note: The helper functions are now in the API route and not needed here