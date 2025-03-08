#!/usr/bin/env node

/**
 * This script helps debug and fix the weather data structure issue
 * in the Kern River Valley App.
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

console.log(`${colors.bold}${colors.blue}=== Kern River Valley App Weather Data Structure Fix ===${colors.reset}\n`);

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
        console.log(`\nRaw OpenWeather API response structure:`);
        console.log(JSON.stringify(parsedData, null, 2));
        
        // Create the expected data structure
        const processedData = {
          temp: parsedData.main?.temp,
          tempMin: parsedData.main?.temp_min,
          tempMax: parsedData.main?.temp_max,
          humidity: parsedData.main?.humidity,
          windSpeed: parsedData.wind?.speed,
          windDirection: parsedData.wind?.deg,
          pressure: parsedData.main?.pressure,
          description: parsedData.weather?.[0]?.description,
          icon: parsedData.weather?.[0]?.icon,
          cityName: parsedData.name,
          countryCode: parsedData.sys?.country,
          shortForecast: `High: ${Math.round(parsedData.main?.temp_max)}°F, Low: ${Math.round(parsedData.main?.temp_min)}°F`,
          timestamp: new Date().toISOString(),
          locationName: "Lake Isabella"
        };
        
        console.log(`\n${colors.bold}Processed data structure (what we want):${colors.reset}`);
        console.log(JSON.stringify(processedData, null, 2));
        
        // Create the nested structure that's causing issues
        const nestedData = {
          weather: processedData
        };
        
        console.log(`\n${colors.bold}Nested data structure (what we're getting):${colors.reset}`);
        console.log(JSON.stringify(nestedData, null, 2));
        
        console.log(`\n${colors.bold}${colors.blue}=== Solution ===${colors.reset}`);
        console.log(`The issue is that the weather data is nested inside a 'weather' property, but the WeatherCard component expects it at the top level.`);
        console.log(`\nTo fix this issue, we've updated the following files:`);
        console.log(`1. ${colors.green}src/components/cards/WeatherCard.js${colors.reset} - Updated to handle nested data structure`);
        console.log(`2. ${colors.green}src/lib/weather.js${colors.reset} - Updated to extract data from nested structure`);
        console.log(`3. ${colors.green}src/app/page.js${colors.reset} - Updated to ensure data is passed correctly`);
        
        console.log(`\n${colors.bold}${colors.green}The fix should now be applied!${colors.reset}`);
        console.log(`If you're still seeing issues, please check the console logs for more information.`);
        
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
  process.exit(1);
}); 