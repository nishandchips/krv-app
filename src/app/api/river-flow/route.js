export async function GET() {
  try {
    // Fetch data from Army Corps of Engineers for North Fork Kern River
    const usaceResponse = await fetch('https://www.spk-wc.usace.army.mil/fcgi-bin/hourly.py?report=isb&textonly=true', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store'
    });

    if (!usaceResponse.ok) {
      throw new Error(`USACE server responded with status: ${usaceResponse.status}`);
    }

    const usaceText = await usaceResponse.text();
    
    // Parse the USACE text data for North Fork flow
    const northForkData = parseUSACEDataForNorthFork(usaceText);
    
    // Fetch data from USGS for South Fork Kern River
    const southForkUrl = 'https://waterservices.usgs.gov/nwis/iv/?format=json&sites=11189500&period=P7D&parameterCd=00060&siteStatus=all';
    const southForkResponse = await fetch(southForkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store'
    });

    if (!southForkResponse.ok) {
      throw new Error(`USGS server responded with status: ${southForkResponse.status}`);
    }

    const southForkData = await southForkResponse.json();
    const processedSouthForkData = processUSGSData(southForkData);
    
    // Create the final data structure
    const processedData = {
      northFork: {
        value: northForkData.currentFlow,
        status: getFlowStatus('northFork', northForkData.currentFlow),
        timestamp: northForkData.currentTimestamp
      },
      southFork: {
        value: processedSouthForkData.currentValue,
        status: getFlowStatus('southFork', processedSouthForkData.currentValue),
        timestamp: processedSouthForkData.currentTimestamp
      },
      northForkHistory: northForkData.history,
      northFork24h: northForkData.last24Hours,
      northFork7d: northForkData.history,
      southForkHistory: processedSouthForkData.values,
      southFork24h: filterLast24Hours(processedSouthForkData.values),
      southFork7d: processedSouthForkData.values,
      lastUpdated: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(processedData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Detailed error:', error);
    
    // Return a fallback structure with error information
    const fallbackData = {
      northFork: { value: null, status: 'unknown', timestamp: null },
      southFork: { value: null, status: 'unknown', timestamp: null },
      northForkHistory: [],
      northFork24h: [],
      northFork7d: [],
      southForkHistory: [],
      southFork24h: [],
      southFork7d: [],
      lastUpdated: new Date().toISOString(),
      error: error.message
    };
    
    return new Response(
      JSON.stringify(fallbackData),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Parse the text data from USACE to extract North Fork flow information
function parseUSACEDataForNorthFork(textData) {
  try {
    const lines = textData.split('\n');
    const flowData = [];
    
    // Find the data rows
    let dataStarted = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if we've reached the data section
      if (line.startsWith('Date') && lines[i+1] && lines[i+1].includes('(ft)') && lines[i+1].includes('(ac-ft)')) {
        dataStarted = true;
        continue;
      }
      
      // Parse data rows
      if (dataStarted && line.match(/^\d{2}[A-Z]{3}\d{4}/)) {
        // This is a data row
        const parts = line.split(/\s+/);
        
        if (parts.length >= 6) {
          const date = parts[0];
          const time = parts[1];
          const timestamp = parseUSACEDate(`${date} ${time}`);
          
          // North Fork flow is in column 6 (index 5)
          const flow = parseFloat(parts[5]);
          
          if (!isNaN(flow)) {
            flowData.push({
              timestamp: timestamp.toISOString(),
              flow: flow
            });
          }
        }
      }
    }
    
    // Sort data by timestamp to ensure chronological order
    flowData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Get the current flow (most recent data point)
    const currentFlow = flowData.length > 0 ? flowData[flowData.length - 1].flow : null;
    const currentTimestamp = flowData.length > 0 ? flowData[flowData.length - 1].timestamp : null;
    
    // Filter for last 24 hours
    const last24Hours = filterLast24Hours(flowData);
    
    return {
      currentFlow,
      currentTimestamp,
      history: flowData,
      last24Hours
    };
  } catch (error) {
    console.error('Error parsing USACE data for North Fork:', error);
    return {
      currentFlow: null,
      currentTimestamp: null,
      history: [],
      last24Hours: []
    };
  }
}

// Process USGS data for South Fork
function processUSGSData(data) {
  try {
    if (!data || !data.value || !data.value.timeSeries || data.value.timeSeries.length === 0) {
      throw new Error('Invalid USGS data structure');
    }
    
    const timeSeries = data.value.timeSeries[0];
    const values = timeSeries.values[0].value;
    
    const processedValues = values.map(item => ({
      timestamp: item.dateTime,
      flow: parseFloat(item.value)
    }));
    
    // Sort by timestamp
    processedValues.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Get the current value (most recent data point)
    const currentValue = processedValues.length > 0 ? processedValues[processedValues.length - 1].flow : null;
    const currentTimestamp = processedValues.length > 0 ? processedValues[processedValues.length - 1].timestamp : null;
    
    return {
      currentValue,
      currentTimestamp,
      values: processedValues
    };
  } catch (error) {
    console.error('Error processing USGS data:', error);
    return {
      currentValue: null,
      currentTimestamp: null,
      values: []
    };
  }
}

// Filter data for the last 24 hours
function filterLast24Hours(data) {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return data.filter(item => new Date(item.timestamp) >= twentyFourHoursAgo);
}

// Get flow status based on thresholds
function getFlowStatus(fork, flow) {
  if (flow === null || flow === undefined) return 'unknown';
  
  if (fork === 'northFork') {
    // North Fork thresholds
    if (flow < 100) return 'low';
    if (flow < 500) return 'normal';
    if (flow < 1500) return 'high';
    return 'flood';
  } else {
    // South Fork thresholds
    if (flow < 50) return 'low';
    if (flow < 200) return 'normal';
    if (flow < 800) return 'high';
    return 'flood';
  }
}

// Parse USACE date format (e.g., "01MAR2025 1300")
function parseUSACEDate(dateString) {
  const months = {
    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
    'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
  };
  
  // Extract date parts
  const dateParts = dateString.match(/(\d{2})([A-Z]{3})(\d{4})\s+(\d{2})(\d{2})/);
  
  if (!dateParts) return new Date();
  
  const day = parseInt(dateParts[1], 10);
  const month = months[dateParts[2]];
  const year = parseInt(dateParts[3], 10);
  const hour = parseInt(dateParts[4], 10);
  const minute = 0; // Minutes are not provided in the data
  
  return new Date(year, month, day, hour, minute);
} 