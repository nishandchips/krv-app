#!/usr/bin/env node

/**
 * This script tests the OpenWeather API directly to help debug issues
 * with the weather API in the Kern River Valley App.
 */

const https = require('https');
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

console.log(`${colors.bold}${colors.blue}=== Kern River Valley App Weather API Debug ===${colors.reset}\n`);

// Get API key from environment variables
const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

console.log(`API key status: ${apiKey ? `${colors.green}Found${colors.reset}` : `${colors.red}Not found${colors.reset}`}`);

if (!apiKey) {
  console.log(`\n${colors.red}No API key found in environment variables.${colors.reset}`);
  console.log(`Please make sure you have a .env.local file with the following variables:`);
  console.log(`OPENWEATHER_API_KEY=your_api_key_here`);
  console.log(`NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here`);
  
  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  try {
    fs.accessSync(envLocalPath, fs.constants.F_OK);
    console.log(`\n${colors.yellow}A .env.local file exists, but it might not contain the API key.${colors.reset}`);
    console.log(`Please check the contents of your .env.local file and make sure it has the correct API key.`);
  } catch (err) {
    console.log(`\n${colors.yellow}No .env.local file found.${colors.reset}`);
    console.log(`Please create a .env.local file in the root of your project with your API keys.`);
    
    // Try to create an example .env.local file
    try {
      const exampleContent = `# OpenWeather API key
# Get one at https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweather_api_key_here
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Unsplash API key (optional)
# Get one at https://unsplash.com/developers
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
`;
      fs.writeFileSync(`${envLocalPath}.example`, exampleContent);
      console.log(`\n${colors.green}Created .env.local.example file.${colors.reset}`);
      console.log(`You can copy this file to .env.local and add your API keys.`);
    } catch (writeErr) {
      console.log(`\n${colors.red}Could not create example file: ${writeErr.message}${colors.reset}`);
    }
  }
  
  process.exit(1);
}

// Test the OpenWeather API directly
console.log(`\n${colors.bold}Testing OpenWeather API directly:${colors.reset}`);

const lat = '35.6688'; // Lake Isabella
const lon = '-118.2912';
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

console.log(`Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);

https.get(url, (res) => {
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
        console.log(`Temperature: ${parsedData.main.temp}°F`);
        console.log(`Conditions: ${parsedData.weather[0].description}`);
        console.log(`Humidity: ${parsedData.main.humidity}%`);
        console.log(`Wind: ${parsedData.wind.speed} mph`);
        
        console.log(`\n${colors.green}Your API key is working correctly!${colors.reset}`);
        console.log(`If you're still seeing a "Connection Error" in the app, the issue is likely with how the app is accessing the API key.`);
        console.log(`\nTry the following:`);
        console.log(`1. Make sure your .env.local file has both OPENWEATHER_API_KEY and NEXT_PUBLIC_OPENWEATHER_API_KEY set`);
        console.log(`2. Restart your Next.js development server`);
        console.log(`3. Clear your browser cache or try in an incognito window`);
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

// Also check the Next.js API route
console.log(`\n${colors.bold}To test your Next.js API route:${colors.reset}`);
console.log(`1. Make sure your Next.js development server is running`);
console.log(`2. Open a browser and navigate to: http://localhost:3000/api/weather?lat=35.6688&lon=-118.2912`);
console.log(`3. You should see JSON weather data if everything is working correctly`);

console.log(`\n${colors.bold}${colors.blue}=== End of Debug ===${colors.reset}`); 