export async function fetchRoadClosures() {
  try {
    console.log('Client: Fetching road conditions from internal API route');
    
    // Call our internal API route instead of external API directly
    const response = await fetch('/api/road-conditions', { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Client: Road conditions API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Client: Road conditions data received:', data);
    
    return {
      roadClosures: data.roadClosures || [],
      roadConditions: data.roadConditions || []
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