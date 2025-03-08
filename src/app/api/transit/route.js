import { fetchTransitData } from '@/lib/transit/transitData';

export async function GET(request) {
  try {
    // Get route IDs from query parameters
    const { searchParams } = new URL(request.url);
    const routeIds = searchParams.get('routes')?.split(',') || ['150', '220', '227'];
    
    // Fetch transit data
    const transitData = await fetchTransitData(routeIds);
    
    // Return the data
    return Response.json(transitData);
  } catch (error) {
    console.error('Error fetching transit data:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch transit data',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 