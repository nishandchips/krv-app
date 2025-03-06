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
    
    // Parse the USACE text data to get both lake elevation and storage data
    const lakeData = parseUSACEDataForLake(usaceText);
    
    // Log the first few entries for debugging
    if (lakeData.length > 0) {
      console.log('Sample lake data (first 2 entries):', JSON.stringify(lakeData.slice(0, 2), null, 2));
    }
    
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

// Parse the text data from USACE to extract both lake elevation and storage information
function parseUSACEDataForLake(textData) {
  try {
    const lines = textData.split('\n');
    const lakeData = [];
    
    console.log(`Processing ${lines.length} lines of USACE data`);
    
    // Find the data rows
    let dataHeaderLine = -1;
    
    // First, find the header line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('Date') && line.includes('Time') && 
          lines[i+1] && lines[i+1].includes('(ft)') && 
          lines[i+1].includes('(ac-ft)')) {
        dataHeaderLine = i;
        break;
      }
    }
    
    if (dataHeaderLine === -1) {
      console.error('Could not find data header line in USACE data');
      return [];
    }
    
    console.log(`Found data header at line ${dataHeaderLine}: ${lines[dataHeaderLine]}`);
    console.log(`Header details: ${lines[dataHeaderLine+1]}`);
    
    // Parse data rows (start 2 lines after the header)
    for (let i = dataHeaderLine + 2; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if the line starts with a date pattern (e.g., "04MAR2025")
      if (line.match(/^\d{2}[A-Z]{3}\d{4}/)) {
        // Split by whitespace
        const parts = line.split(/\s+/);
        
        // Debug the parts array for the first few lines
        if (i < dataHeaderLine + 5) {
          console.log(`Line ${i}: ${line}`);
          console.log(`Parsed ${parts.length} parts:`, parts);
        }
        
        if (parts.length >= 4) { // We need at least 4 columns for Date, Time, Elev, Storage
          const date = parts[0];
          const time = parts[1];
          
          try {
            const timestamp = parseUSACEDate(`${date} ${time}`);
            
            // Lake elevation in feet (column 3)
            const elevation = parseFloat(parts[2]);
            
            // Lake storage in acre-feet (column 4)
            const storage = parseInt(parts[3], 10);
            
            // Debug the parsed values
            if (i < dataHeaderLine + 5) {
              console.log(`Parsed values: date=${date}, time=${time}, elevation=${elevation}, storage=${storage}`);
            }
            
            if (!isNaN(elevation) && !isNaN(storage)) {
              lakeData.push({
                timestamp: timestamp.toISOString(),
                elevation: elevation,
                storage: storage,
                level: storage // Add level property for backward compatibility with LakeStorageCard
              });
            } else {
              console.error(`Invalid data at line ${i}: elevation=${elevation}, storage=${storage}, parts=`, parts);
            }
          } catch (e) {
            console.error(`Error parsing date at line ${i}: ${e.message}`);
          }
        } else {
          console.warn(`Skipping line ${i}: insufficient parts (${parts.length})`);
        }
      }
    }
    
    console.log(`Successfully parsed ${lakeData.length} data points`);
    
    // Sort data by timestamp to ensure chronological order
    lakeData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return lakeData;
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
  
  if (!dateParts) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  
  const day = parseInt(dateParts[1], 10);
  const month = months[dateParts[2]];
  const year = parseInt(dateParts[3], 10);
  const hour = parseInt(dateParts[4], 10);
  const minute = 0; // Minutes are not provided in the data
  
  if (isNaN(day) || month === undefined || isNaN(year) || isNaN(hour)) {
    throw new Error(`Invalid date components: day=${day}, month=${month}, year=${year}, hour=${hour}`);
  }
  
  return new Date(year, month, day, hour, minute);
}
