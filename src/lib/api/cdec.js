// Move existing cdec.js content here 

export async function fetchLakeLevels() {
  try {
    const response = await fetch('/api/lake-levels');
    if (!response.ok) {
      throw new Error(`Failed to fetch lake levels: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle legacy data format if needed (temporary for backward compatibility)
    if (data.length > 0 && data[0].level !== undefined && data[0].elevation === undefined) {
      return data;
    }
    
    // Return data in the expected format
    return data;
  } catch (error) {
    console.error('Error fetching lake levels:', error);
    return [];
  }
} 