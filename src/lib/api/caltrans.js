export async function fetchRoadClosures() {
  try {
    // Fetch data for both highways
    const [hwy178Response, hwy155Response] = await Promise.all([
      fetch('https://roads.dot.ca.gov/roadinfo/m178'),
      fetch('https://roads.dot.ca.gov/roadinfo/m155')
    ]);
    
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
    
    console.log('Road data fetched:', { closures, roadConditions });
    
    return {
      roadClosures: closures,
      roadConditions: roadConditions
    };
  } catch (error) {
    console.error('Error fetching road data:', error);
    return {
      roadClosures: [],
      roadConditions: []
    };
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
    console.error('Error extracting description:', error);
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
          return line.trim();
        }
      }
      
      // If we can't find a specific line but there are conditions in the description
      if (conditionKeywords.some(keyword => description.includes(keyword))) {
        // Return the first part of the description
        return description.split('.')[0] + '.';
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting road conditions:', error);
    return null;
  }
} 