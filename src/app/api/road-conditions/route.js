export async function GET() {
  return await fetchAndProcessRoadData();
}

export async function POST(request) {
  // For POST requests, we'll always force a fresh fetch
  return await fetchAndProcessRoadData(true);
}

async function fetchAndProcessRoadData(forceRefresh = false) {
  try {
    console.log('Server: Fetching road conditions data from Caltrans API - ' + new Date().toISOString());
    console.log('Force refresh:', forceRefresh ? 'Yes' : 'No');
    
    // Generate a unique timestamp for cache busting
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    
    // Fetch data for both highways using Caltrans API with aggressive cache-busting
    const [hwy178Response, hwy155Response] = await Promise.all([
      fetch(`https://roads.dot.ca.gov/?roadnumber=178&_nocache=${timestamp}&r=${randomStr}${forceRefresh ? '&force=true' : ''}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }),
      fetch(`https://roads.dot.ca.gov/?roadnumber=155&_nocache=${timestamp}&r=${randomStr}${forceRefresh ? '&force=true' : ''}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
    console.log('FULL HWY 155 DATA:', hwy155Data); // Log the full data for debugging
    console.log('FULL HWY 178 DATA:', hwy178Data); // Log the full data for debugging
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
    if (hwy178Conditions && !isFalsePositive(hwy178Conditions)) {
      roadConditions.push({
        highway: '178',
        description: hwy178Conditions
      });
      console.log('Found conditions for Highway 178:', hwy178Conditions);
    } else {
      console.log('No conditions found for Highway 178');
    }
    
    // Check for conditions on Highway 155
    const hwy155Conditions = extractRoadConditions(hwy155Data, 'SR 155');
    if (hwy155Conditions && !isFalsePositive(hwy155Conditions)) {
      roadConditions.push({
        highway: '155',
        description: hwy155Conditions
      });
      console.log('Found conditions for Highway 155:', hwy155Conditions);
    } else {
      console.log('No conditions found for Highway 155');
    }
    
    // Log the extracted conditions
    console.log('-----EXTRACTED CONDITIONS-----');
    console.log('Road Conditions:', JSON.stringify(roadConditions, null, 2));
    console.log('-----------------------------');
    
    // Perform a manual check of the Caltrans website to verify our results
    try {
      const websiteData = await checkCaltransWebsite();
      
      // Compare our results with the website data and override if necessary
      if (websiteData) {
        // Check Highway 155
        if (websiteData.hwy155HasNoRestrictions && roadConditions.some(c => c.highway === '155')) {
          console.log('OVERRIDE: Website shows NO restrictions for Highway 155, removing conditions');
          roadConditions = roadConditions.filter(c => c.highway !== '155');
        } else if (!websiteData.hwy155HasNoRestrictions && !roadConditions.some(c => c.highway === '155') && websiteData.hwy155Conditions) {
          console.log('OVERRIDE: Website shows conditions for Highway 155, adding them');
          roadConditions.push({
            highway: '155',
            description: websiteData.hwy155Conditions
          });
        }
        
        // Check Highway 178
        if (websiteData.hwy178HasNoRestrictions && roadConditions.some(c => c.highway === '178')) {
          console.log('OVERRIDE: Website shows NO restrictions for Highway 178, removing conditions');
          roadConditions = roadConditions.filter(c => c.highway !== '178');
        } else if (!websiteData.hwy178HasNoRestrictions && !roadConditions.some(c => c.highway === '178') && websiteData.hwy178Conditions) {
          console.log('OVERRIDE: Website shows conditions for Highway 178, adding them');
          roadConditions.push({
            highway: '178',
            description: websiteData.hwy178Conditions
          });
        }
      }
    } catch (error) {
      console.error('Error checking Caltrans website:', error);
    }
    
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
    console.log(`Extracting conditions for ${highwayPrefix}...`);
    
    // Check if we're dealing with HTML (from the main website) or plain text (from the API)
    const isHtml = data.includes('<!DOCTYPE html>') || data.includes('<html');
    
    if (isHtml) {
      return extractConditionsFromHtml(data, highwayPrefix);
    }
    
    // Define all possible condition keywords
    const conditionKeywords = [
      'CHAINS', 'SNOW TIRES', 'ICY', 'SNOW', 'FOG', 'WIND', 
      'CONSTRUCTION', 'DEBRIS', 'ROCK', 'MUDSLIDE', 'FLOODED',
      'RESTRICTIONS', 'REDUCED VISIBILITY', 'SLIPPERY'
    ];
    
    // Define phrases that indicate no restrictions
    const noRestrictionPhrases = [
      'NO TRAFFIC RESTRICTIONS',
      'NO RESTRICTIONS',
      'NO CHAIN CONTROLS',
      'NO CONTROLS'
    ];
    
    // Split the data to get the specific highway section
    const parts = data.split(highwayPrefix);
    if (parts.length <= 1) {
      console.log(`No section found for ${highwayPrefix}`);
      return null;
    }

    // Get the section specific to this highway
    const highwaySection = parts[1].trim();
    console.log(`Found section for ${highwayPrefix}, length: ${highwaySection.length} chars`);
    
    // First check if the section explicitly states there are no restrictions
    if (noRestrictionPhrases.some(phrase => highwaySection.includes(phrase))) {
      console.log(`Section explicitly states no restrictions for ${highwayPrefix}`);
      return null;
    }
    
    // Check if any condition keywords are present in the highway section
    // This ensures we only detect conditions for this specific highway
    const foundKeywords = conditionKeywords.filter(keyword => highwaySection.includes(keyword));
    if (foundKeywords.length === 0) {
      console.log(`No condition keywords found in ${highwayPrefix} section`);
      return null;
    }
    console.log(`Found keywords in ${highwayPrefix} section:`, foundKeywords);
    
    // Look for area markers like [IN THE CENTRAL CALIFORNIA AREA]
    const areaMarker = highwaySection.includes('[IN THE') ? '[IN THE' : '[IN ';
    const areaParts = highwaySection.split(areaMarker);

    if (areaParts.length <= 1) {
      console.log(`No area markers found in ${highwayPrefix} section`);
      // If we can't find area markers, try to extract conditions directly
      const lines = highwaySection.split('\n');
      
      // Check each line for "NO TRAFFIC RESTRICTIONS" first
      for (const line of lines) {
        if (noRestrictionPhrases.some(phrase => line.includes(phrase))) {
          console.log(`Line explicitly states no restrictions: ${line.trim()}`);
          return null;
        }
      }
      
      // Then check for actual conditions
      for (const line of lines) {
        // Skip lines that contain "NO" followed by a condition keyword
        if (line.includes('NO ') && conditionKeywords.some(keyword => line.includes(keyword))) {
          continue;
        }
        
        if (conditionKeywords.some(keyword => line.includes(keyword))) {
          console.log(`Found condition in line: ${line.trim()}`);
          return line.trim();
        }
      }
      
      // If we can't find a specific line but there are conditions in the description
      // and it doesn't contain "NO" followed by a condition keyword
      const hasCondition = conditionKeywords.some(keyword => 
        highwaySection.includes(keyword) && !highwaySection.includes(`NO ${keyword}`)
      );
      
      if (hasCondition) {
        const firstSentence = highwaySection.split('.')[0] + '.';
        console.log(`Returning first sentence: ${firstSentence}`);
        return firstSentence;
      }
      
      console.log(`No conditions found in ${highwayPrefix} section despite keywords`);
      return null;
    }

    console.log(`Found ${areaParts.length - 1} area sections in ${highwayPrefix}`);
    
    // Process each area section
    for (let i = 1; i < areaParts.length; i++) {
      const areaSection = areaParts[i];
      const areaEnd = areaSection.indexOf(']');

      if (areaEnd === -1) {
        console.log(`No closing bracket found in area section ${i}`);
        continue;
      }

      const areaText = areaSection.substring(areaEnd + 1).trim();
      console.log(`Area ${i} text length: ${areaText.length} chars`);
      
      // Skip sections that mention "NO RESTRICTIONS" or "NO TRAFFIC RESTRICTIONS"
      if (noRestrictionPhrases.some(phrase => areaText.includes(phrase))) {
        console.log(`Area ${i} mentions NO RESTRICTIONS, skipping`);
        continue;
      }
      
      const paragraphs = areaText.split('\n').filter(p => p.trim());
      console.log(`Area ${i} has ${paragraphs.length} paragraphs`);

      for (let j = 0; j < paragraphs.length; j++) {
        // Skip paragraphs that contain "NO" followed by a condition keyword
        if (paragraphs[j].includes('NO ') && 
            conditionKeywords.some(keyword => paragraphs[j].includes(keyword))) {
          continue;
        }
        
        const matchedKeywords = conditionKeywords.filter(keyword => paragraphs[j].includes(keyword));
        if (matchedKeywords.length > 0) {
          console.log(`Found keywords in paragraph ${j}:`, matchedKeywords);
          let condition = paragraphs[j].trim();
          let k = j + 1;
          while (k < paragraphs.length && !paragraphs[k].includes('[') && paragraphs[k].trim() !== '') {
            condition += ' ' + paragraphs[k].trim();
            k++;
          }
          console.log(`Returning condition: ${condition}`);
          return condition;
        }
      }
    }

    console.log(`No conditions found in any area section of ${highwayPrefix}`);
    return null;
  } catch (error) {
    console.error('Error extracting road conditions:', error);
    return null;
  }
}

// Helper function to extract conditions from HTML format
function extractConditionsFromHtml(html, highwayPrefix) {
  try {
    console.log(`Extracting conditions from HTML for ${highwayPrefix}...`);
    
    // Define condition keywords to search for
    const conditionKeywords = [
      'CHAINS', 'SNOW TIRES', 'ICY', 'SNOW', 'FOG', 'WIND', 
      'CONSTRUCTION', 'DEBRIS', 'ROCK', 'MUDSLIDE', 'FLOODED',
      'RESTRICTIONS', 'REDUCED VISIBILITY', 'SLIPPERY',
      'controlled traffic', '1-way', 'one-way', 'lane closure'
    ];
    
    // Check for "No traffic restrictions" text
    if (html.includes('No traffic restrictions are reported for this area')) {
      console.log(`HTML explicitly states no restrictions for ${highwayPrefix}`);
      return null;
    }
    
    // Extract the highway section
    const highwaySection = extractHighwaySection(html, highwayPrefix);
    if (!highwaySection) {
      console.log(`Could not find section for ${highwayPrefix} in HTML`);
      return null;
    }
    
    console.log(`Found highway section for ${highwayPrefix}, length: ${highwaySection.length} chars`);
    
    // Check if the section contains any condition keywords
    const foundKeywords = conditionKeywords.filter(keyword => 
      highwaySection.includes(keyword.toUpperCase()) || 
      highwaySection.includes(keyword.toLowerCase()) ||
      highwaySection.includes(keyword)
    );
    
    if (foundKeywords.length === 0) {
      console.log('No condition keywords found in highway section');
      return null;
    }
    
    console.log('Found condition keywords in highway section:', foundKeywords);
    
    // Clean up the highway section text to get just the conditions
    const cleanedText = cleanHighwaySectionText(highwaySection);
    if (cleanedText) {
      console.log('Extracted condition text:', cleanedText);
      return cleanedText;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting conditions from HTML:', error);
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
      console.log(`Could not find heading for ${highwayPrefix}`);
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

// Helper function to manually check the Caltrans website
async function checkCaltransWebsite() {
  try {
    console.log('-----MANUAL CALTRANS WEBSITE CHECK-----');
    
    // Fetch the specific highway pages directly
    const [hwy155Response, hwy178Response] = await Promise.all([
      fetch('https://roads.dot.ca.gov/?roadnumber=155', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html',
          'Cache-Control': 'no-cache'
        }
      }),
      fetch('https://roads.dot.ca.gov/?roadnumber=178', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html',
          'Cache-Control': 'no-cache'
        }
      })
    ]);
    
    if (!hwy155Response.ok || !hwy178Response.ok) {
      console.error('Failed to fetch highway pages:', {
        hwy155Status: hwy155Response.status,
        hwy178Status: hwy178Response.status
      });
      return null;
    }
    
    const hwy155Html = await hwy155Response.text();
    const hwy178Html = await hwy178Response.text();
    
    console.log('Highway 155 page length:', hwy155Html.length);
    console.log('Highway 178 page length:', hwy178Html.length);
    
    // Extract text from HTML
    const extractTextFromHtml = (html) => {
      // Look for the road information section
      const roadInfoStart = html.indexOf('Road Information');
      if (roadInfoStart === -1) return '';
      
      // Extract a chunk of text from the road information section
      const roadInfoSection = html.substring(roadInfoStart, roadInfoStart + 2000);
      
      // Extract text from paragraphs and list items
      const paragraphMatches = roadInfoSection.match(/<p[^>]*>(.*?)<\/p>/g) || [];
      const listItemMatches = roadInfoSection.match(/<li[^>]*>(.*?)<\/li>/g) || [];
      const divMatches = roadInfoSection.match(/<div[^>]*>(.*?)<\/div>/g) || [];
      
      // Combine all text elements and remove HTML tags
      return [...paragraphMatches, ...listItemMatches, ...divMatches]
        .map(element => element.replace(/<[^>]*>/g, '').trim())
        .join(' ');
    };
    
    const hwy155Text = extractTextFromHtml(hwy155Html);
    const hwy178Text = extractTextFromHtml(hwy178Html);
    
    console.log('Highway 155 extracted text:', hwy155Text.substring(0, 200) + '...');
    console.log('Highway 178 extracted text:', hwy178Text.substring(0, 200) + '...');
    
    // Check for "No traffic restrictions" text
    const hwy155HasNoRestrictions = hwy155Html.includes('No traffic restrictions are reported for this area');
    const hwy178HasNoRestrictions = hwy178Html.includes('No traffic restrictions are reported for this area');
    
    console.log('Highway 155 explicitly states no restrictions:', hwy155HasNoRestrictions);
    console.log('Highway 178 explicitly states no restrictions:', hwy178HasNoRestrictions);
    
    // Check for conditions on Highway 155
    const hwy155HasChains = hwy155Text.includes('CHAINS') || hwy155Text.includes('chains');
    const hwy155HasSnowTires = hwy155Text.includes('SNOW TIRES') || hwy155Text.includes('snow tires');
    const hwy155HasRestrictions = (hwy155Text.includes('RESTRICTIONS') || hwy155Text.includes('restrictions')) && 
                                 !hwy155HasNoRestrictions;
    const hwy155HasConstruction = hwy155Text.includes('CONSTRUCTION') || hwy155Text.includes('construction');
    
    // Extract conditions for Highway 155 if any
    let hwy155Conditions = null;
    if (!hwy155HasNoRestrictions && (hwy155HasChains || hwy155HasSnowTires || hwy155HasRestrictions || hwy155HasConstruction)) {
      hwy155Conditions = extractConditionsFromHtml(hwy155Html, 'SR 155');
    }
    
    console.log('Highway 155 conditions from website:');
    console.log('- Chains:', hwy155HasChains);
    console.log('- Snow Tires:', hwy155HasSnowTires);
    console.log('- Restrictions:', hwy155HasRestrictions);
    console.log('- Construction:', hwy155HasConstruction);
    console.log('- No Restrictions:', hwy155HasNoRestrictions);
    console.log('- Conditions Text:', hwy155Conditions);
    
    // Check for conditions on Highway 178
    const hwy178HasChains = hwy178Text.includes('CHAINS') || hwy178Text.includes('chains');
    const hwy178HasSnowTires = hwy178Text.includes('SNOW TIRES') || hwy178Text.includes('snow tires');
    const hwy178HasRestrictions = (hwy178Text.includes('RESTRICTIONS') || hwy178Text.includes('restrictions')) && 
                                 !hwy178HasNoRestrictions;
    const hwy178HasConstruction = hwy178Text.includes('CONSTRUCTION') || hwy178Text.includes('construction');
    
    // Extract conditions for Highway 178 if any
    let hwy178Conditions = null;
    if (!hwy178HasNoRestrictions && (hwy178HasChains || hwy178HasSnowTires || hwy178HasRestrictions || hwy178HasConstruction)) {
      hwy178Conditions = extractConditionsFromHtml(hwy178Html, 'SR 178');
    }
    
    console.log('Highway 178 conditions from website:');
    console.log('- Chains:', hwy178HasChains);
    console.log('- Snow Tires:', hwy178HasSnowTires);
    console.log('- Restrictions:', hwy178HasRestrictions);
    console.log('- Construction:', hwy178HasConstruction);
    console.log('- No Restrictions:', hwy178HasNoRestrictions);
    console.log('- Conditions Text:', hwy178Conditions);
    
    console.log('-----END MANUAL CHECK-----');
    
    return {
      hwy155HasChains,
      hwy155HasSnowTires,
      hwy155HasRestrictions,
      hwy155HasConstruction,
      hwy155HasNoRestrictions,
      hwy155Conditions,
      hwy178HasChains,
      hwy178HasSnowTires,
      hwy178HasRestrictions,
      hwy178HasConstruction,
      hwy178HasNoRestrictions,
      hwy178Conditions
    };
  } catch (error) {
    console.error('Error in manual Caltrans check:', error);
    return null;
  }
}

// Helper function to check for false positives in road conditions
function isFalsePositive(conditionText) {
  if (!conditionText) return true;
  
  // Check for phrases that indicate no actual restrictions
  const falsePositiveIndicators = [
    'NO RESTRICTIONS',
    'NO TRAFFIC RESTRICTIONS',
    'ARE REPORTED',
    'IS REPORTED',
    'NO CHAIN CONTROLS',
    'NO TRAFFIC RESTRICTIONS ARE REPORTED',
    'NO RESTRICTIONS ARE REPORTED',
    'NO CONTROLS'
  ];
  
  // Check if any of the false positive indicators are present
  if (falsePositiveIndicators.some(indicator => conditionText.toUpperCase().includes(indicator))) {
    console.log('False positive detected:', conditionText);
    return true;
  }
  
  // Check if the condition text is too short or generic
  if (conditionText.length < 10) {
    console.log('Condition text too short, likely false positive:', conditionText);
    return true;
  }
  
  // Check if the text contains "open" without restrictions
  if (conditionText.toUpperCase().includes('OPEN') && 
      !conditionText.toUpperCase().includes('CHAIN') && 
      !conditionText.toUpperCase().includes('SNOW') && 
      !conditionText.toUpperCase().includes('RESTRICTION')) {
    console.log('Road is open without restrictions:', conditionText);
    return true;
  }
  
  return false;
} 