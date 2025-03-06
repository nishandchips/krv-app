/**
 * Locations around the Kern River Valley
 */
export const locations = [
  { 
    id: 'kernville', 
    name: 'Kernville', 
    lat: 35.7548, 
    lon: -118.4249,
    description: 'A mountain community at the gateway to the Sequoia National Forest'
  },
  { 
    id: 'lake-isabella', 
    name: 'Lake Isabella', 
    lat: 35.6688, 
    lon: -118.2912,
    description: 'A community on the shores of Lake Isabella reservoir'
  },
  { 
    id: 'walker-basin', 
    name: 'Walker Basin', 
    lat: 35.4087, 
    lon: -118.5831,
    description: 'Also known as Caliente, a peaceful mountain valley'
  },
  { 
    id: 'weldon', 
    name: 'Weldon', 
    lat: 35.6598, 
    lon: -118.1940,
    description: 'A community in the Kern River Valley east of Lake Isabella'
  },
  { 
    id: 'onyx', 
    name: 'Onyx', 
    lat: 35.6880, 
    lon: -118.1490,
    description: 'A small community in the South Fork valley'
  }
];

/**
 * Get location data by ID
 */
export function getLocationById(id) {
  return locations.find(loc => loc.id === id) || locations[1]; // Default to Lake Isabella
}

/**
 * Get default location
 */
export function getDefaultLocation() {
  return locations[1]; // Lake Isabella
} 