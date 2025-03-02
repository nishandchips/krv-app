import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch data from Army Corps of Engineers for Lake Isabella storage
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
    
    // Parse the USACE text data to get lake storage in acre-feet
    const lakeData = parseUSACEDataForLake(usaceText);
    
    return new Response(JSON.stringify(lakeData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch lake level data',
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

// Parse the text data from USACE to extract lake storage information
function parseUSACEDataForLake(textData) {
  try {
    const lines = textData.split('\n');
    const lakeStorage = [];
    
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
        
        if (parts.length >= 4) {
          const date = parts[0];
          const time = parts[1];
          const timestamp = parseUSACEDate(`${date} ${time}`);
          
          // Lake storage in acre-feet
          const storage = parseInt(parts[3], 10);
          
          if (!isNaN(storage)) {
            lakeStorage.push({
              timestamp: timestamp.toISOString(),
              level: storage // Using acre-feet instead of elevation
            });
          }
        }
      }
    }
    
    // Sort data by timestamp to ensure chronological order
    lakeStorage.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return lakeStorage;
  } catch (error) {
    console.error('Error parsing USACE data for lake:', error);
    return [];
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
