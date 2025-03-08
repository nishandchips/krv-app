#!/usr/bin/env node

/**
 * This script tests the local weather API to help debug issues
 * with the weather API in the Kern River Valley App.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

console.log(`${colors.bold}${colors.blue}=== Kern River Valley App Local Weather API Debug ===${colors.reset}\n`);

// Get API key from environment variables
const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

console.log(`API key status: ${apiKey ? `${colors.green}Found${colors.reset}` : `${colors.red}Not found${colors.reset}`}`);

if (!apiKey) {
  console.log(`\n${colors.red}No API key found in environment variables.${colors.reset}`);
  console.log(`Please make sure you have a .env.local file with the following variables:`);
  console.log(`OPENWEATHER_API_KEY=your_api_key_here`);
  console.log(`NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here`);
  process.exit(1);
}

// Test the OpenWeather API directly
console.log(`\n${colors.bold}Testing OpenWeather API directly:${colors.reset}`);

const lat = '35.6688'; // Lake Isabella
const lon = '-118.2912';
const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

console.log(`Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);

http.get(url, (res) => {
  let data = '';
  
  console.log(`Response status code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`${colors.green}API request successful!${colors.reset}`);
      try {
        const parsedData = JSON.parse(data);
        console.log(`\nWeather data for ${parsedData.name || 'location'}:`);
        console.log(`Temperature: ${parsedData.main?.temp}°F`);
        console.log(`Conditions: ${parsedData.weather?.[0]?.description}`);
        console.log(`Humidity: ${parsedData.main?.humidity}%`);
        console.log(`Wind: ${parsedData.wind?.speed} mph`);
        
        // Check for required fields
        const requiredFields = ['main', 'weather'];
        const missingFields = requiredFields.filter(field => !parsedData[field]);
        
        if (missingFields.length > 0) {
          console.log(`\n${colors.red}✗ Missing required fields: ${missingFields.join(', ')}${colors.reset}`);
        } else {
          console.log(`\n${colors.green}✓ All required fields are present${colors.reset}`);
        }
        
        // Check for required properties
        if (parsedData.main) {
          const requiredProps = ['temp', 'temp_min', 'temp_max', 'humidity'];
          const missingProps = requiredProps.filter(prop => parsedData.main[prop] === undefined);
          
          if (missingProps.length > 0) {
            console.log(`\n${colors.red}✗ Missing required properties in 'main': ${missingProps.join(', ')}${colors.reset}`);
          } else {
            console.log(`\n${colors.green}✓ All required properties in 'main' are present${colors.reset}`);
          }
        }
        
        // Check weather array
        if (parsedData.weather && Array.isArray(parsedData.weather) && parsedData.weather.length > 0) {
          console.log(`\n${colors.green}✓ Weather array is present and not empty${colors.reset}`);
          
          const weatherItem = parsedData.weather[0];
          const requiredWeatherProps = ['description', 'icon'];
          const missingWeatherProps = requiredWeatherProps.filter(prop => !weatherItem[prop]);
          
          if (missingWeatherProps.length > 0) {
            console.log(`\n${colors.red}✗ Missing required properties in 'weather[0]': ${missingWeatherProps.join(', ')}${colors.reset}`);
          } else {
            console.log(`\n${colors.green}✓ All required properties in 'weather[0]' are present${colors.reset}`);
          }
        } else {
          console.log(`\n${colors.red}✗ Weather array is missing or empty${colors.reset}`);
        }
        
        // Test the local API
        testLocalApi();
      } catch (error) {
        console.log(`${colors.red}Error parsing API response:${colors.reset}`, error);
        console.log(`Raw response: ${data}`);
      }
    } else {
      console.log(`${colors.red}API request failed with status code ${res.statusCode}${colors.reset}`);
      console.log(`Response: ${data}`);
      
      if (res.statusCode === 401) {
        console.log(`\n${colors.red}Authentication error: Your API key may be invalid or expired.${colors.reset}`);
        console.log(`Please check your API key at https://home.openweathermap.org/api_keys`);
      }
    }
  });
}).on('error', (error) => {
  console.log(`${colors.red}Error making API request:${colors.reset}`, error);
});

function testLocalApi() {
  console.log(`\n${colors.bold}Testing local API:${colors.reset}`);
  console.log(`Making request to: http://localhost:3000/api/weather?lat=35.6688&lon=-118.2912`);
  
  http.get('http://localhost:3000/api/weather?lat=35.6688&lon=-118.2912', (res) => {
    let data = '';
    
    console.log(`Response status code: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`${colors.green}API request successful!${colors.reset}`);
        try {
          const parsedData = JSON.parse(data);
          console.log(`\nProcessed weather data:`);
          console.log(JSON.stringify(parsedData, null, 2));
          
          // Check for required fields
          const requiredFields = ['temp', 'tempMin', 'tempMax', 'humidity', 'description', 'icon'];
          const missingFields = requiredFields.filter(field => parsedData[field] === undefined);
          
          if (missingFields.length > 0) {
            console.log(`\n${colors.red}✗ Missing required fields in processed data: ${missingFields.join(', ')}${colors.reset}`);
          } else {
            console.log(`\n${colors.green}✓ All required fields are present in processed data${colors.reset}`);
          }
          
          console.log(`\n${colors.bold}${colors.blue}=== Debugging Recommendations ===${colors.reset}`);
          if (missingFields.length > 0) {
            console.log(`1. Check the data transformation in src/app/api/weather/route.js`);
            console.log(`2. Make sure the API response is being properly processed`);
            console.log(`3. Add more validation and error handling`);
          } else {
            console.log(`Your local API is working correctly! If you're still seeing issues in the UI:`);
            console.log(`1. Check how the data is being passed to the WeatherCard component`);
            console.log(`2. Verify that the WeatherCard component is correctly checking for valid data`);
            console.log(`3. Look for any client-side transformations that might be affecting the data`);
          }
          
          process.exit(0);
        } catch (error) {
          console.log(`${colors.red}Error parsing API response:${colors.reset}`, error);
          console.log(`Raw response: ${data}`);
          process.exit(1);
        }
      } else {
        console.log(`${colors.red}API request failed with status code ${res.statusCode}${colors.reset}`);
        console.log(`Response: ${data}`);
        process.exit(1);
      }
    });
  }).on('error', (error) => {
    console.log(`${colors.red}Error making API request:${colors.reset}`, error);
    console.log(`\nMake sure your Next.js development server is running on port 3000.`);
    process.exit(1);
  });
} 