import sampleData from '../../data/transit/sample_transit_data.json';

/**
 * Fetch transit data for the specified routes
 * @param {string[]} routeIds - Array of route IDs to fetch data for
 * @returns {Promise<Object>} - Transit data for the specified routes
 */
export async function fetchTransitData(routeIds = ['150', '220', '227']) {
  try {
    // In a production environment, we would fetch from an API or processed GTFS data
    // For now, we'll use the sample data
    
    // Filter the data to only include the requested routes
    const filteredData = {};
    
    for (const routeId of routeIds) {
      if (sampleData[routeId]) {
        filteredData[routeId] = sampleData[routeId];
      }
    }
    
    return filteredData;
  } catch (error) {
    console.error('Error fetching transit data:', error);
    return {};
  }
}

/**
 * Format time string (HH:MM:SS) to AM/PM format
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {string} - Formatted time string
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get payment method description
 * @param {string} paymentMethod - Payment method code
 * @returns {string} - Payment method description
 */
export function getPaymentMethodDescription(paymentMethod) {
  const methods = {
    '0': 'Pay on board',
    '1': 'Pay before boarding',
    '2': 'Pay at either location'
  };
  
  return methods[paymentMethod] || 'Unknown payment method';
}

/**
 * Get transfers description
 * @param {string} transfers - Transfers code
 * @returns {string} - Transfers description
 */
export function getTransfersDescription(transfers) {
  const transferOptions = {
    '0': 'No transfers permitted',
    '1': 'One transfer permitted',
    '2': 'Two transfers permitted',
    '3': 'Unlimited transfers permitted'
  };
  
  return transferOptions[transfers] || 'Unknown transfer option';
} 