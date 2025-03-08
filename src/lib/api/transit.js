/**
 * Fetch transit data from the API
 * @param {string[]} routeIds - Array of route IDs to fetch data for
 * @returns {Promise<Object>} - Transit data for the specified routes
 */
export async function fetchTransitData(routeIds = ['150', '220', '227']) {
  try {
    const routeParam = routeIds.join(',');
    const response = await fetch(`/api/transit?routes=${routeParam}`, {
      cache: 'no-store',
      next: { revalidate: 86400 } // Revalidate once per day
    });
    
    if (!response.ok) {
      throw new Error(`Transit API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transit data:', error);
    return {};
  }
} 