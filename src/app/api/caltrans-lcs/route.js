/**
 * API route for fetching Caltrans Lane Closure System (LCS) data
 * Documentation: https://cwwp2.dot.ca.gov/documentation/lcs/lcs.htm
 */

export async function GET(request) {
  return await fetchAndProcessLcsData();
}

export async function POST(request) {
  // For POST requests, we'll always force a fresh fetch
  return await fetchAndProcessLcsData(true);
}

async function fetchAndProcessLcsData(forceRefresh = false) {
  try {
    console.log('Server: Fetching Caltrans LCS data');
    console.log('Force refresh:', forceRefresh ? 'Yes' : 'No');
    
    // Generate timestamp for cache busting
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    
    // Fetch data from Caltrans LCS API for District 6 (Central California)
    const response = await fetch(`https://cwwp2.dot.ca.gov/data/d6/lcs/lcsStatusD06.json?_nocache=${timestamp}&r=${randomStr}${forceRefresh ? '&force=true' : ''}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('Server: Error fetching Caltrans LCS data:', response.status);
      return Response.json({ 
        error: 'Failed to fetch Caltrans LCS data',
        closures: [],
        conditions: []
      }, { status: 500 });
    }
    
    // Parse the JSON response
    const lcsData = await response.json();
    
    // Process the data to extract relevant information for highways 155 and 178
    const { closures, conditions } = processLcsData(lcsData);
    
    // Log the processed data
    console.log('Server: Processed Caltrans LCS data:', { 
      closuresCount: closures.length, 
      conditionsCount: conditions.length 
    });
    
    // Return the processed data
    return Response.json({
      closures,
      conditions,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Server: Error processing Caltrans LCS data:', error);
    return Response.json({ 
      error: 'Error processing Caltrans LCS data',
      closures: [],
      conditions: []
    }, { status: 500 });
  }
}

/**
 * Process the LCS data to extract relevant information for highways 155 and 178
 * @param {Object} lcsData - The raw LCS data from the Caltrans API
 * @returns {Object} - Processed closures and conditions
 */
function processLcsData(lcsData) {
  // Initialize arrays for closures and conditions
  const closures = [];
  const conditions = [];
  
  // Check if data exists and has items
  if (!lcsData || !lcsData.data || !Array.isArray(lcsData.data)) {
    console.warn('Server: No LCS data found or invalid format');
    return { closures, conditions };
  }
  
  // Get current date and time
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Process each LCS item
  lcsData.data.forEach(item => {
    if (!item.lcs || !item.lcs.location || !item.lcs.closure) {
      return; // Skip invalid items
    }
    
    const lcs = item.lcs;
    const location = lcs.location;
    const closure = lcs.closure;
    
    // Extract route information
    let route = '';
    let county = '';
    
    if (location.begin && location.begin.beginRoute) {
      route = location.begin.beginRoute;
      county = location.begin.beginCounty || '';
    }
    
    // Skip if not SR-155 or SR-178
    if (route !== 'SR-155' && route !== 'SR-178' && route !== 'SR-155' && route !== 'SR-178') {
      return;
    }
    
    // Normalize route number (remove "SR-" prefix)
    const routeNumber = route.replace('SR-', '');
    
    // Extract closure information
    const closureType = closure.typeOfClosure;
    const workType = closure.typeOfWork;
    const startDate = closure.closureTimestamp.closureStartDate;
    const startTime = closure.closureTimestamp.closureStartTime;
    const endDate = closure.closureTimestamp.closureEndDate;
    const endTime = closure.closureTimestamp.closureEndTime;
    const isIndefinite = closure.closureTimestamp.isClosureEndIndefinite === 'true';
    const lanesClosed = closure.lanesClosed;
    const totalLanes = closure.totalExistingLanes;
    
    // Parse start and end dates/times
    const startDateTime = parseDateTime(startDate, startTime);
    const endDateTime = parseDateTime(endDate, endTime);
    
    // Skip if the closure hasn't started yet
    if (startDateTime > now) {
      console.log(`Skipping future closure for ${routeNumber} starting on ${startDate} at ${startTime}`);
      return;
    }
    
    // Skip if the closure has already ended (and it's not recurring)
    if (!isIndefinite && endDateTime < now && !isRecurringClosure(workType)) {
      console.log(`Skipping past closure for ${routeNumber} that ended on ${endDate} at ${endTime}`);
      return;
    }
    
    // For recurring closures (like the one in the screenshot), we need special handling
    if (isRecurringClosure(workType) || isRecurringClosure(closureType)) {
      // Check if today is a valid day for the closure
      const isValidDay = isValidDayForClosure(workType, currentDayOfWeek);
      
      if (!isValidDay) {
        console.log(`Skipping closure for ${routeNumber} as it's not active today (${getDayName(currentDayOfWeek)})`);
        return;
      }
      
      // For recurring closures, we'll show them even if the current time is outside the hours
      // This matches what Caltrans does on their website
    }
    
    // Create a description of the closure
    let closureDescription = '';
    
    // Add location information
    if (location.begin && location.end) {
      const beginLocation = location.begin.beginLocationName || '';
      const endLocation = location.end.endLocationName || '';
      const nearbyPlace = location.begin.beginNearbyPlace || '';
      
      if (beginLocation && endLocation && beginLocation !== endLocation) {
        closureDescription += `${closureType} from ${beginLocation} to ${endLocation}`;
      } else if (beginLocation) {
        closureDescription += `${closureType} at ${beginLocation}`;
      } else if (nearbyPlace) {
        closureDescription += `${closureType} near ${nearbyPlace}`;
      }
    }
    
    // For recurring closures, show the schedule instead of "until X time"
    if (isRecurringClosure(workType) || isRecurringClosure(closureType)) {
      if (startTime && endTime) {
        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);
        
        // Extract days pattern from the work type
        const daysPattern = extractDaysPattern(workType);
        
        if (daysPattern) {
          closureDescription += ` ${daysPattern} from ${formattedStartTime} to ${formattedEndTime}`;
        } else {
          closureDescription += ` from ${formattedStartTime} to ${formattedEndTime} daily`;
        }
      }
    } else {
      // For non-recurring closures, show when it ends
      if (endDate && endTime && !isIndefinite) {
        const formattedEndDate = formatDate(endDate);
        const formattedEndTime = formatTime(endTime);
        
        const today = new Date();
        const isToday = today.toISOString().split('T')[0] === endDate;
        
        if (isToday) {
          closureDescription += ` until ${formattedEndTime} today`;
        } else {
          closureDescription += ` until ${formattedEndTime} on ${formattedEndDate}`;
        }
      } else if (isIndefinite) {
        closureDescription += ' until further notice';
      }
    }
    
    // Add work type if not already included in the description
    if (workType && !closureDescription.toLowerCase().includes(workType.toLowerCase())) {
      closureDescription += ` - Due to ${workType.toLowerCase()}`;
    }
    
    // Add lanes information
    if (lanesClosed && totalLanes) {
      closureDescription += ` (${lanesClosed} of ${totalLanes} lanes closed)`;
    }
    
    // Determine if this is a full closure or just a condition
    if (closureType.toLowerCase().includes('full')) {
      closures.push({
        highway: routeNumber,
        description: closureDescription.trim(),
        county
      });
    } else {
      conditions.push({
        highway: routeNumber,
        description: closureDescription.trim(),
        county
      });
    }
  });
  
  return { closures, conditions };
}

/**
 * Check if a closure is recurring based on its description
 * @param {string} description - The closure description
 * @returns {boolean} - Whether the closure is recurring
 */
function isRecurringClosure(description) {
  if (!description) return false;
  
  const lowerDesc = description.toLowerCase();
  
  // Check for common patterns that indicate recurring closures
  return lowerDesc.includes('monday') ||
         lowerDesc.includes('tuesday') ||
         lowerDesc.includes('wednesday') ||
         lowerDesc.includes('thursday') ||
         lowerDesc.includes('friday') ||
         lowerDesc.includes('saturday') ||
         lowerDesc.includes('sunday') ||
         lowerDesc.includes('weekday') ||
         lowerDesc.includes('weekend') ||
         lowerDesc.includes('daily') ||
         lowerDesc.includes('nightly') ||
         lowerDesc.includes('mon') ||
         lowerDesc.includes('tue') ||
         lowerDesc.includes('wed') ||
         lowerDesc.includes('thu') ||
         lowerDesc.includes('fri') ||
         lowerDesc.includes('sat') ||
         lowerDesc.includes('sun') ||
         lowerDesc.includes('thru') ||
         lowerDesc.includes('through');
}

/**
 * Check if today is a valid day for a recurring closure
 * @param {string} description - The closure description
 * @param {number} currentDayOfWeek - The current day of the week (0 = Sunday, 1 = Monday, etc.)
 * @returns {boolean} - Whether today is a valid day for the closure
 */
function isValidDayForClosure(description, currentDayOfWeek) {
  if (!description) return true; // If no description, assume it's valid
  
  const lowerDesc = description.toLowerCase();
  
  // Check for weekday pattern (Monday through Friday)
  if ((lowerDesc.includes('weekday') || lowerDesc.includes('week day') || 
       (lowerDesc.includes('monday') && lowerDesc.includes('friday') && 
        (lowerDesc.includes('thru') || lowerDesc.includes('through')))) && 
      currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
    return true;
  }
  
  // Check for weekend pattern
  if (lowerDesc.includes('weekend') && (currentDayOfWeek === 0 || currentDayOfWeek === 6)) {
    return true;
  }
  
  // Check for daily pattern
  if (lowerDesc.includes('daily')) {
    return true;
  }
  
  // Check for specific days
  const days = extractDaysOfWeek(description);
  if (days.length > 0) {
    return days.includes(currentDayOfWeek);
  }
  
  // If no day pattern is found, assume it's valid for all days
  return true;
}

/**
 * Extract a human-readable days pattern from a description
 * @param {string} description - The description text
 * @returns {string|null} - A human-readable days pattern, or null if none found
 */
function extractDaysPattern(description) {
  if (!description) return null;
  
  const lowerDesc = description.toLowerCase();
  
  // Check for common patterns
  if (lowerDesc.includes('monday') && lowerDesc.includes('friday') && 
      (lowerDesc.includes('thru') || lowerDesc.includes('through'))) {
    return 'Monday thru Friday';
  }
  
  if (lowerDesc.includes('weekday') || lowerDesc.includes('week day')) {
    return 'weekdays';
  }
  
  if (lowerDesc.includes('weekend')) {
    return 'weekends';
  }
  
  if (lowerDesc.includes('daily')) {
    return 'daily';
  }
  
  // If no pattern is found, return null
  return null;
}

/**
 * Extract days of the week from a description
 * @param {string} description - The description text
 * @returns {number[]} - Array of day numbers (0 = Sunday, 1 = Monday, etc.)
 */
function extractDaysOfWeek(description) {
  const days = [];
  const lowerDesc = description.toLowerCase();
  
  // Check for common day patterns
  if (lowerDesc.includes('monday')) days.push(1);
  if (lowerDesc.includes('tuesday')) days.push(2);
  if (lowerDesc.includes('wednesday')) days.push(3);
  if (lowerDesc.includes('thursday')) days.push(4);
  if (lowerDesc.includes('friday')) days.push(5);
  if (lowerDesc.includes('saturday')) days.push(6);
  if (lowerDesc.includes('sunday')) days.push(0);
  
  // Check for abbreviations
  if (lowerDesc.includes('mon')) days.push(1);
  if (lowerDesc.includes('tue')) days.push(2);
  if (lowerDesc.includes('wed')) days.push(3);
  if (lowerDesc.includes('thu')) days.push(4);
  if (lowerDesc.includes('fri')) days.push(5);
  if (lowerDesc.includes('sat')) days.push(6);
  if (lowerDesc.includes('sun')) days.push(0);
  
  // Check for weekday/weekend patterns
  if (lowerDesc.includes('weekday') || lowerDesc.includes('week day')) {
    days.push(1, 2, 3, 4, 5);
  }
  
  if (lowerDesc.includes('weekend')) {
    days.push(0, 6);
  }
  
  // Remove duplicates
  return [...new Set(days)];
}

/**
 * Get the name of a day from its number
 * @param {number} dayNumber - The day number (0 = Sunday, 1 = Monday, etc.)
 * @returns {string} - The day name
 */
function getDayName(dayNumber) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
}

/**
 * Parse a date and time string into a Date object
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {Date} - Date object
 */
function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    return new Date(0); // Return epoch time if date or time is missing
  }
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  
  // JavaScript months are 0-indexed
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Format a date string from YYYY-MM-DD to MM/DD/YYYY
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  const [year, month, day] = dateStr.split('-');
  return `${month}/${day}/${year}`;
}

/**
 * Format a time string from HH:MM:SS to h:MM AM/PM
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {string} - Formatted time string
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
} 