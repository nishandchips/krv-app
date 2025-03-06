export async function GET() {
  try {
    console.log('Server: Fetching road conditions data from Caltrans API - ' + new Date().toISOString());
    
    // Fetch data for both highways using Caltrans API with cache-busting query parameter
    const timestamp = Date.now();
    const [hwy178Response, hwy155Response] = await Promise.all([
      fetch(`https://roads.dot.ca.gov/roadinfo/sr178?_nocache=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }),
      fetch(`https://roads.dot.ca.gov/roadinfo/sr155?_nocache=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    ]);
    
    // Check if the responses are ok
    if (!hwy178Response.ok || !hwy155Response.ok) {
      console.error('Server: Error fetching road data from Caltrans API', {
        hwy178Status: hwy178Response.status,
        hwy155Status: hwy155Response.status
      });
      return Response.json({ 
        error: 'Failed to fetch road data from Caltrans API',
        roadClosures: [],
        roadConditions: []
      }, { status: 500 });
    }
    
    // Process the data
    const hwy178Data = await hwy178Response.text();
    const hwy155Data = await hwy155Response.text();
    
    // Log the raw data for debugging
    console.log('-----RAW DATA FROM CALTRANS-----');
    console.log('HWY 178:', hwy178Data.substring(0, 500)); // Show first 500 chars
    console.log('HWY 155:', hwy155Data.substring(0, 500)); // Show first 500 chars
    console.log('--------------------------------');
    
    // Process the data
    const closures = [];
    const roadConditions = [];
    
    // Process Highway 178 data
    if (hwy178Data.includes('CLOSED')) {
      closures.push({
        highway: '178',
        description: extractDescription(hwy178Data, 'SR 178')
      });
    }
    
    // Process Highway 155 data
    if (hwy155Data.includes('CLOSED')) {
      closures.push({
        highway: '155',
        description: extractDescription(hwy155Data, 'SR 155')
      });
    }
    
    // Check for conditions on Highway 178
    const hwy178Conditions = extractRoadConditions(hwy178Data, 'SR 178');
    if (hwy178Conditions) {
      roadConditions.push({
        highway: '178',
        description: hwy178Conditions
      });
    }
    
    // Check for conditions on Highway 155
    const hwy155Conditions = extractRoadConditions(hwy155Data, 'SR 155');
    if (hwy155Conditions) {
      roadConditions.push({
        highway: '155',
        description: hwy155Conditions
      });
    }
    
    // Log the extracted conditions
    console.log('-----EXTRACTED CONDITIONS-----');
    console.log('Road Conditions:', JSON.stringify(roadConditions, null, 2));
    console.log('-----------------------------');
    
    console.log('Server: Road data processed successfully', { 
      closuresCount: closures.length, 
      conditionsCount: roadConditions.length 
    });
    
    // Return the response with cache control headers
    return new Response(JSON.stringify({
      roadClosures: closures,
      roadConditions: roadConditions,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Server: Error processing road data:', error);
    return Response.json({ 
      error: 'Error processing road data',
      roadClosures: [],
      roadConditions: []
    }, { status: 500 });
  }
}

// Helper function to extract description from the text
function extractDescription(data, highwayPrefix) {
  try {
    const parts = data.split(highwayPrefix);
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return 'Road closed';
  } catch (error) {
    console.error('Server: Error extracting description:', error);
    return 'Road closed';
  }
}

// Helper function to extract road conditions from the text
function extractRoadConditions(data, highwayPrefix) {
  try {
    if (!data.includes('CHAINS') && !data.includes('SNOW') && !data.includes('TIRES')) {
      return null;
    }

    const parts = data.split(highwayPrefix);
    if (parts.length <= 1) {
      return null;
    }

    const highwaySection = parts[1].trim();
    const areaMarker = highwaySection.includes('[IN THE') ? '[IN THE' : '[IN ';
    const areaParts = highwaySection.split(areaMarker);

    if (areaParts.length <= 1) {
      return null;
    }

    for (let i = 1; i < areaParts.length; i++) {
      const areaSection = areaParts[i];
      const areaEnd = areaSection.indexOf(']');

      if (areaEnd === -1) continue;

      const areaText = areaSection.substring(areaEnd + 1).trim();
      const paragraphs = areaText.split('\n').filter(p => p.trim());

      for (let j = 0; j < paragraphs.length; j++) {
        if (paragraphs[j].includes('CHAINS') || paragraphs[j].includes('SNOW TIRES')) {
          let condition = paragraphs[j].trim();
          let k = j + 1;
          while (k < paragraphs.length && !paragraphs[k].includes('[') && paragraphs[k].trim() !== '') {
            condition += ' ' + paragraphs[k].trim();
            k++;
          }
          return condition;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting road conditions:', error);
    return null;
  }
} 