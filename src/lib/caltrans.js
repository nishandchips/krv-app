export async function fetchRoadClosures() {
  try {
    // Fetch data for both highways using Caltrans API and direct road info
    const [d8Response, d9Response, hwy178Response, hwy155Response] = await Promise.all([
      fetch('https://cwwp2.dot.ca.gov/data/d8/lcs/lcsStatusD08.json'),
      fetch('https://cwwp2.dot.ca.gov/data/d9/lcs/lcsStatusD09.json'),
      fetch('https://roads.dot.ca.gov/roadinfo/m178'),
      fetch('https://roads.dot.ca.gov/roadinfo/m155')
    ]);
    
    // Process closure data from Caltrans API
    const d8Data = await d8Response.json();
    const d9Data = await d9Response.json();
    const allClosures = [...(d8Data.closures || []), ...(d9Data.closures || [])];
    const closures = allClosures.filter(closure => closure.route === '178' || closure.route === '155')
      .map(closure => ({
        highway: closure.route,
        description: closure.description || 'Road closed'
      }));
    
    // Process road conditions from text data
    const hwy178Data = await hwy178Response.text();
    const hwy155Data = await hwy155Response.text();
    
    const roadConditions = [];
    
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