// Move existing cdec.js content here 

export async function fetchLakeLevels() {
  try {
    const response = await fetch('/api/lake-levels');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching lake levels:', error);
    return [];
  }
} 