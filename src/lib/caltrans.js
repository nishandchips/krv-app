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

/**
 * Fetch road closures and conditions from the Caltrans Lane Closure System (LCS) API
 * This uses the official Caltrans LCS API which is updated every 5 minutes
 * Documentation: https://cwwp2.dot.ca.gov/documentation/lcs/lcs.htm
 */
export async function fetchRoadClosuresLCS() {
  try {
    console.log('Client: Fetching road conditions from Caltrans LCS API');
    
    // Generate timestamp for cache busting
    const timestamp = Date.now();
    
    // Call our internal API route for the LCS data
    const response = await fetch(`/api/caltrans-lcs?_nocache=${timestamp}`, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Client: Caltrans LCS API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Client: Caltrans LCS data received:', data);
    console.log('Client: Timestamp of data:', data.timestamp);
    
    return {
      roadClosures: data.closures || [],
      roadConditions: data.conditions || [],
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error fetching Caltrans LCS data:', error);
    return {
      roadClosures: [],
      roadConditions: []
    };
  }
}

/**
 * Force refresh the road conditions data by bypassing all caches
 */
export async function forceRefreshRoadConditions() {
  try {
    console.log('Client: Force refreshing road conditions data');
    
    // Generate unique timestamp for cache busting
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    
    // Try to fetch from the LCS API first
    try {
      const lcsResponse = await fetch(`/api/caltrans-lcs?_nocache=${timestamp}&r=${randomStr}&forceRefresh=true`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        method: 'POST',
        body: JSON.stringify({ forceRefresh: true })
      });
      
      if (lcsResponse.ok) {
        const lcsData = await lcsResponse.json();
        console.log('Client: Fresh LCS data received:', lcsData);
        
        return {
          roadClosures: lcsData.closures || [],
          roadConditions: lcsData.conditions || [],
          timestamp: lcsData.timestamp,
          source: 'lcs'
        };
      }
    } catch (lcsError) {
      console.error('Error fetching from LCS API, falling back to legacy API:', lcsError);
    }
    
    // Fall back to the legacy API if LCS fails
    const response = await fetch(`/api/road-conditions?_nocache=${timestamp}&r=${randomStr}&forceRefresh=true`, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      method: 'POST',
      body: JSON.stringify({ forceRefresh: true })
    });
    
    console.log('Client: Force refresh response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Client: Fresh road conditions data received:', data);
    
    return {
      roadClosures: data.roadClosures || [],
      roadConditions: data.roadConditions || [],
      timestamp: data.timestamp,
      source: 'legacy'
    };
  } catch (error) {
    console.error('Error force refreshing road data:', error);
    return {
      roadClosures: [],
      roadConditions: [],
      error: error.message
    };
  }
}

// Note: The helper functions are now in the API route and not needed here