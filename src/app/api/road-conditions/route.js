export async function GET() {
  try {
    console.log('Server: Fetching road conditions data from Caltrans API');
    
    // Fetch data for both highways using Caltrans API
    const [hwy178Response, hwy155Response] = await Promise.all([
      fetch('https://roads.dot.ca.gov/roadinfo/sr178'),
      fetch('https://roads.dot.ca.gov/roadinfo/sr155')
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
    
    console.log('Server: Road data processed successfully', { 
      closuresCount: closures.length, 
      conditionsCount: roadConditions.length 
    });
    
    return Response.json({
      roadClosures: closures,
      roadConditions: roadConditions
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
    const parts = data.split(highwayPrefix);
    if (parts.length > 1) {
      const description = parts[1].trim();
      
      // Look for various road conditions
      const conditionKeywords = [
        'CHAINS', 'SNOW TIRES', 'ICY', 'SNOW', 'FOG', 'WIND', 
        'CONSTRUCTION', 'DEBRIS', 'ROCK', 'MUDSLIDE', 'FLOODED'
      ];
      
      // Extract the relevant part about conditions
      const lines = description.split('\n');
      for (const line of lines) {
        if (conditionKeywords.some(keyword => line.includes(keyword))) {
          // Return the full line without truncation
          return line.trim();
        }
      }
      
      // If we can't find a specific line but there are conditions in the description
      if (conditionKeywords.some(keyword => description.includes(keyword))) {
        // Find the sentence containing the condition and return the full sentence
        const sentences = description.split('.');
        for (const sentence of sentences) {
          if (conditionKeywords.some(keyword => sentence.includes(keyword))) {
            return sentence.trim() + '.';
          }
        }
        return description; // Return full description if we can't segment properly
      }
    }
    return null;
  } catch (error) {
    console.error('Server: Error extracting road conditions:', error);
    return null;
  }
} 