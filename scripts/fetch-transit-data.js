// Script to fetch and process GTFS data
import { fetchAndProcessGTFS } from '../src/lib/transit/fetchGTFS.js';

console.log('Starting GTFS data fetch and processing...');

fetchAndProcessGTFS()
  .then(data => {
    console.log('GTFS data fetched and processed successfully');
    console.log(`Processed ${Object.keys(data).length} routes`);
  })
  .catch(error => {
    console.error('Error fetching and processing GTFS data:', error);
    process.exit(1);
  }); 