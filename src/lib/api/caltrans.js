export async function fetchRoadClosures() {
  try {
    const response = await fetch('https://roads.dot.ca.gov/roadinfo/m178');
    const data = await response.text();
    
    // Extract road closures from the text
    const closures = [];
    if (data.includes('CLOSED')) {
      closures.push({
        description: data.split('SR 178')[1].trim()
      });
    }
    
    return closures;
  } catch (error) {
    console.error('Error fetching road closures:', error);
    return [];
  }
} 