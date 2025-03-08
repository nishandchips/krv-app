/**
 * Script to fetch and process GTFS data from Kern Transit
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import AdmZip from 'adm-zip';

const streamPipeline = promisify(pipeline);

// URLs and paths
const GTFS_URL = 'https://kerntransit.org/wp-content/uploads/2023/10/google_transit.zip';
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'transit');
const ZIP_PATH = path.join(DATA_DIR, 'google_transit.zip');
const EXTRACT_PATH = path.join(DATA_DIR, 'gtfs');
const PROCESSED_PATH = path.join(DATA_DIR, 'processed');

// Target routes we're interested in
const TARGET_ROUTES = ['150', '220', '227'];

/**
 * Download the GTFS zip file
 */
async function downloadGTFS() {
  try {
    // Create directories if they don't exist
    await mkdir(DATA_DIR, { recursive: true });
    
    console.log(`Downloading GTFS data from ${GTFS_URL}...`);
    
    return new Promise((resolve, reject) => {
      https.get(GTFS_URL, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download GTFS data: ${response.statusCode}`));
          return;
        }
        
        const fileStream = createWriteStream(ZIP_PATH);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log('Download completed');
          resolve();
        });
        
        fileStream.on('error', err => {
          fs.unlink(ZIP_PATH, () => {});
          reject(err);
        });
      }).on('error', err => {
        fs.unlink(ZIP_PATH, () => {});
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error downloading GTFS data:', error);
    throw error;
  }
}

/**
 * Extract the GTFS zip file
 */
function extractGTFS() {
  try {
    console.log(`Extracting GTFS data to ${EXTRACT_PATH}...`);
    
    // Create extract directory if it doesn't exist
    if (!fs.existsSync(EXTRACT_PATH)) {
      fs.mkdirSync(EXTRACT_PATH, { recursive: true });
    }
    
    const zip = new AdmZip(ZIP_PATH);
    zip.extractAllTo(EXTRACT_PATH, true);
    
    console.log('Extraction completed');
  } catch (error) {
    console.error('Error extracting GTFS data:', error);
    throw error;
  }
}

/**
 * Parse CSV data
 */
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
}

/**
 * Process GTFS data for target routes
 */
async function processGTFS() {
  try {
    console.log('Processing GTFS data...');
    
    // Create processed directory if it doesn't exist
    if (!fs.existsSync(PROCESSED_PATH)) {
      fs.mkdirSync(PROCESSED_PATH, { recursive: true });
    }
    
    // Read routes.txt to find our target routes
    const routesContent = fs.readFileSync(path.join(EXTRACT_PATH, 'routes.txt'), 'utf8');
    const routes = parseCSV(routesContent);
    
    // Filter for our target routes
    const targetRoutes = routes.filter(route => 
      TARGET_ROUTES.includes(route.route_short_name)
    );
    
    if (targetRoutes.length === 0) {
      console.warn('No target routes found in GTFS data');
      return;
    }
    
    console.log(`Found ${targetRoutes.length} target routes`);
    
    // Get route IDs
    const routeIds = targetRoutes.map(route => route.route_id);
    
    // Read trips.txt to find trips for our target routes
    const tripsContent = fs.readFileSync(path.join(EXTRACT_PATH, 'trips.txt'), 'utf8');
    const trips = parseCSV(tripsContent);
    
    // Filter for trips on our target routes
    const targetTrips = trips.filter(trip => routeIds.includes(trip.route_id));
    
    console.log(`Found ${targetTrips.length} trips for target routes`);
    
    // Get trip IDs and service IDs
    const tripIds = targetTrips.map(trip => trip.trip_id);
    const serviceIds = [...new Set(targetTrips.map(trip => trip.service_id))];
    
    // Read stop_times.txt to find stop times for our target trips
    const stopTimesContent = fs.readFileSync(path.join(EXTRACT_PATH, 'stop_times.txt'), 'utf8');
    const stopTimes = parseCSV(stopTimesContent);
    
    // Filter for stop times on our target trips
    const targetStopTimes = stopTimes.filter(stopTime => tripIds.includes(stopTime.trip_id));
    
    console.log(`Found ${targetStopTimes.length} stop times for target trips`);
    
    // Read stops.txt to get stop information
    const stopsContent = fs.readFileSync(path.join(EXTRACT_PATH, 'stops.txt'), 'utf8');
    const stops = parseCSV(stopsContent);
    
    // Create a map of stop IDs to stop names
    const stopMap = stops.reduce((map, stop) => {
      map[stop.stop_id] = {
        name: stop.stop_name,
        lat: stop.stop_lat,
        lon: stop.stop_lon
      };
      return map;
    }, {});
    
    // Read calendar.txt to get service information
    const calendarContent = fs.readFileSync(path.join(EXTRACT_PATH, 'calendar.txt'), 'utf8');
    const calendar = parseCSV(calendarContent);
    
    // Filter for services used by our target trips
    const targetServices = calendar.filter(service => serviceIds.includes(service.service_id));
    
    console.log(`Found ${targetServices.length} services for target trips`);
    
    // Read fare_attributes.txt to get fare information
    const fareAttributesContent = fs.readFileSync(path.join(EXTRACT_PATH, 'fare_attributes.txt'), 'utf8');
    const fareAttributes = parseCSV(fareAttributesContent);
    
    // Read fare_rules.txt to get fare rules
    const fareRulesContent = fs.readFileSync(path.join(EXTRACT_PATH, 'fare_rules.txt'), 'utf8');
    const fareRules = parseCSV(fareRulesContent);
    
    // Filter for fare rules for our target routes
    const targetFareRules = fareRules.filter(rule => routeIds.includes(rule.route_id));
    
    // Get fare IDs
    const fareIds = [...new Set(targetFareRules.map(rule => rule.fare_id))];
    
    // Filter for fare attributes for our target fares
    const targetFareAttributes = fareAttributes.filter(attr => fareIds.includes(attr.fare_id));
    
    console.log(`Found ${targetFareAttributes.length} fare attributes for target routes`);
    
    // Process data for each target route
    const processedData = {};
    
    for (const route of targetRoutes) {
      const routeId = route.route_id;
      const routeShortName = route.route_short_name;
      
      // Get trips for this route
      const routeTrips = targetTrips.filter(trip => trip.route_id === routeId);
      const routeTripIds = routeTrips.map(trip => trip.trip_id);
      
      // Get stop times for these trips
      const routeStopTimes = targetStopTimes.filter(stopTime => routeTripIds.includes(stopTime.trip_id));
      
      // Group stop times by trip
      const tripStopTimes = {};
      for (const stopTime of routeStopTimes) {
        if (!tripStopTimes[stopTime.trip_id]) {
          tripStopTimes[stopTime.trip_id] = [];
        }
        tripStopTimes[stopTime.trip_id].push({
          ...stopTime,
          stop_name: stopMap[stopTime.stop_id]?.name || 'Unknown Stop',
          stop_lat: stopMap[stopTime.stop_id]?.lat,
          stop_lon: stopMap[stopTime.stop_id]?.lon
        });
      }
      
      // Sort stop times by sequence
      for (const tripId in tripStopTimes) {
        tripStopTimes[tripId].sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));
      }
      
      // Get fare rules for this route
      const routeFareRules = targetFareRules.filter(rule => rule.route_id === routeId);
      const routeFareIds = [...new Set(routeFareRules.map(rule => rule.fare_id))];
      
      // Get fare attributes for these fares
      const routeFareAttributes = targetFareAttributes.filter(attr => routeFareIds.includes(attr.fare_id));
      
      // Store processed data
      processedData[routeShortName] = {
        route_id: routeId,
        route_short_name: routeShortName,
        route_long_name: route.route_long_name,
        trips: routeTrips.map(trip => ({
          trip_id: trip.trip_id,
          service_id: trip.service_id,
          trip_headsign: trip.trip_headsign,
          direction_id: trip.direction_id,
          stops: tripStopTimes[trip.trip_id] || []
        })),
        fares: routeFareAttributes.map(fare => ({
          price: fare.price,
          currency_type: fare.currency_type,
          payment_method: fare.payment_method,
          transfers: fare.transfers
        }))
      };
    }
    
    // Write processed data to file
    fs.writeFileSync(
      path.join(PROCESSED_PATH, 'transit_data.json'),
      JSON.stringify(processedData, null, 2)
    );
    
    console.log('Processing completed');
    return processedData;
  } catch (error) {
    console.error('Error processing GTFS data:', error);
    throw error;
  }
}

/**
 * Main function to fetch and process GTFS data
 */
export async function fetchAndProcessGTFS() {
  try {
    await downloadGTFS();
    extractGTFS();
    return await processGTFS();
  } catch (error) {
    console.error('Error fetching and processing GTFS data:', error);
    throw error;
  }
}

// If this file is run directly, execute the main function
if (require.main === module) {
  fetchAndProcessGTFS()
    .then(() => console.log('GTFS data fetched and processed successfully'))
    .catch(error => console.error('Error:', error));
} 