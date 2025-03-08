/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use src/lib/caltrans.js instead, which uses the API route for better caching and error handling.
 */

export async function fetchRoadClosures() {
  try {
    // Fetch data for both highways
    const [hwy178Response, hwy155Response] = await Promise.all([
      fetch('https://roads.dot.ca.gov/?roadnumber=178'),
      fetch('https://roads.dot.ca.gov/?roadnumber=155')
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
    // Check if we're dealing with HTML (from the main website) or plain text (from the API)
    const isHtml = data.includes('<!DOCTYPE html>') || data.includes('<html');
    
    if (isHtml) {
      // Check for "No traffic restrictions" text
      if (data.includes('No traffic restrictions are reported for this area')) {
        return null;
      }
      
      // Extract the highway section
      const highwaySection = extractHighwaySection(data, highwayPrefix);
      if (!highwaySection) {
        return null;
      }
      
      // Define condition keywords
      const conditionKeywords = [
        'CHAINS', 'SNOW TIRES', 'ICY', 'SNOW', 'FOG', 'WIND', 
        'CONSTRUCTION', 'DEBRIS', 'ROCK', 'MUDSLIDE', 'FLOODED',
        'RESTRICTIONS', 'REDUCED VISIBILITY', 'SLIPPERY',
        'controlled traffic', '1-way', 'one-way', 'lane closure'
      ];
      
      // Check if the section contains any condition keywords
      const hasCondition = conditionKeywords.some(keyword => 
        highwaySection.includes(keyword.toUpperCase()) || 
        highwaySection.includes(keyword.toLowerCase()) ||
        highwaySection.includes(keyword)
      );
      
      if (!hasCondition) {
        return null;
      }
      
      // Clean up the highway section text to get just the conditions
      return cleanHighwaySectionText(highwaySection);
    }
    
    // Original plain text processing
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

// Helper function to extract the specific highway section from the HTML
function extractHighwaySection(html, highwayPrefix) {
  try {
    // Find the highway heading (e.g., "SR 178")
    const highwayHeadingRegex = new RegExp(`<h3[^>]*>${highwayPrefix.replace('SR ', 'SR \\s*')}[^<]*<\\/h3>`, 'i');
    const highwayHeadingMatch = html.match(highwayHeadingRegex);
    
    if (!highwayHeadingMatch) {
      return null;
    }
    
    const headingIndex = highwayHeadingMatch.index;
    const headingEndIndex = headingIndex + highwayHeadingMatch[0].length;
    
    // Find the next heading or a horizontal rule, which would mark the end of this section
    const nextSectionRegex = /<h[1-6]|<hr/i;
    const nextSectionMatch = html.substring(headingEndIndex).match(nextSectionRegex);
    
    const sectionEndIndex = nextSectionMatch 
      ? headingEndIndex + nextSectionMatch.index 
      : headingEndIndex + 1000; // If no next section, take a reasonable chunk
    
    // Extract the section
    return html.substring(headingIndex, sectionEndIndex);
  } catch (error) {
    console.error('Error extracting highway section:', error);
    return null;
  }
}

// Helper function to clean up the highway section text
function cleanHighwaySectionText(sectionHtml) {
  try {
    // Remove the heading
    const withoutHeading = sectionHtml.replace(/<h3[^>]*>.*?<\/h3>/i, '');
    
    // Remove any area markers like "[IN THE CENTRAL CALIFORNIA AREA]"
    const withoutAreaMarkers = withoutHeading.replace(/\[\s*IN\s+THE\s+[^\]]+\]/gi, '').trim();
    
    // If there's nothing left after removing markers, return null
    if (!withoutAreaMarkers) return null;
    
    // Check if it contains "No traffic restrictions"
    if (withoutAreaMarkers.includes('No traffic restrictions')) {
      return null;
    }
    
    // Extract text from paragraphs, divs, or directly
    const paragraphMatch = withoutAreaMarkers.match(/<p[^>]*>(.*?)<\/p>/is);
    const divMatch = withoutAreaMarkers.match(/<div[^>]*>(.*?)<\/div>/is);
    
    let conditionText = '';
    
    if (paragraphMatch) {
      conditionText = paragraphMatch[1];
    } else if (divMatch) {
      conditionText = divMatch[1];
    } else {
      // If no paragraph or div, just take the text
      conditionText = withoutAreaMarkers;
    }
    
    // Remove any HTML tags
    conditionText = conditionText.replace(/<[^>]*>/g, '').trim();
    
    // Remove any excessive whitespace
    conditionText = conditionText.replace(/\s+/g, ' ').trim();
    
    return conditionText;
  } catch (error) {
    console.error('Error cleaning highway section text:', error);
    return null;
  }
} 