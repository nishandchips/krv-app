#!/usr/bin/env node

/**
 * Weather API Tester
 * 
 * This script tests the OpenWeather API directly to verify your API key
 * and check if the service is responding correctly.
 * 
 * Usage:
 *   node scripts/check-weather-api.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}=== Kern River Valley App - Weather API Tester ===${colors.reset}\n`);

// Get API key from .env.local
let apiKey = null;
try {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_OPENWEATHER_API_KEY=([^\n]*)/);
    if (match && match[1].trim()) {
      apiKey = match[1].trim();
      console.log(`${colors.green}✓ Found API key in .env.local${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ API key not found or empty in .env.local${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}! .env.local file not found${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error reading .env.local: ${error.message}${colors.reset}`);
}

if (!apiKey) {
  console.log(`${colors.yellow}! No API key found. Please enter your OpenWeather API key:${colors.reset}`);
  process.exit(1);
}

// Test coordinates for Kernville area
const lat = 35.6688;
const lon = -118.2912;

// Test current weather API
console.log(`\n${colors.bold}Testing Current Weather API...${colors.reset}`);
const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

console.log(`${colors.blue}URL: ${currentWeatherUrl.replace(apiKey, 'API_KEY_HIDDEN')}${colors.reset}`);

https.get(currentWeatherUrl, (res) => {
  let data = '';
  
  console.log(`${colors.blue}Status Code: ${res.statusCode}${colors.reset}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`${colors.green}✓ Current Weather API responded successfully${colors.reset}`);
      
      try {
        const parsedData = JSON.parse(data);
        console.log(`${colors.blue}Response Data:${colors.reset}`);
        console.log(`  City: ${parsedData.name}`);
        console.log(`  Temperature: ${parsedData.main.temp}°F`);
        console.log(`  Weather: ${parsedData.weather[0].description}`);
        console.log(`  Wind: ${parsedData.wind.speed} mph`);
        
        // Test forecast API after current weather succeeds
        testForecastAPI();
      } catch (error) {
        console.error(`${colors.red}Error parsing response: ${error.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ Current Weather API request failed${colors.reset}`);
      console.log(`${colors.red}Response: ${data}${colors.reset}`);
    }
  });
}).on('error', (error) => {
  console.error(`${colors.red}Error making request: ${error.message}${colors.reset}`);
});

// Test forecast API
function testForecastAPI() {
  console.log(`\n${colors.bold}Testing Weather Forecast API...${colors.reset}`);
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  
  console.log(`${colors.blue}URL: ${forecastUrl.replace(apiKey, 'API_KEY_HIDDEN')}${colors.reset}`);
  
  https.get(forecastUrl, (res) => {
    let data = '';
    
    console.log(`${colors.blue}Status Code: ${res.statusCode}${colors.reset}`);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`${colors.green}✓ Forecast API responded successfully${colors.reset}`);
        
        try {
          const parsedData = JSON.parse(data);
          console.log(`${colors.blue}Response Data:${colors.reset}`);
          console.log(`  City: ${parsedData.city.name}`);
          console.log(`  Forecast Count: ${parsedData.list.length} entries`);
          
          // Show first forecast entry
          const firstForecast = parsedData.list[0];
          const date = new Date(firstForecast.dt * 1000);
          console.log(`  First Forecast: ${date.toLocaleString()}`);
          console.log(`    Temperature: ${firstForecast.main.temp}°F`);
          console.log(`    Weather: ${firstForecast.weather[0].description}`);
          
          // Show summary and recommendations
          showSummary(true, true);
        } catch (error) {
          console.error(`${colors.red}Error parsing response: ${error.message}${colors.reset}`);
          showSummary(true, false);
        }
      } else {
        console.log(`${colors.red}✗ Forecast API request failed${colors.reset}`);
        console.log(`${colors.red}Response: ${data}${colors.reset}`);
        showSummary(true, false);
      }
    });
  }).on('error', (error) => {
    console.error(`${colors.red}Error making request: ${error.message}${colors.reset}`);
    showSummary(true, false);
  });
}

// Show summary and recommendations
function showSummary(currentWeatherSuccess, forecastSuccess) {
  console.log(`\n${colors.bold}${colors.cyan}=== Summary ===${colors.reset}\n`);
  
  if (currentWeatherSuccess && forecastSuccess) {
    console.log(`${colors.green}✓ All API tests passed successfully!${colors.reset}`);
    console.log(`${colors.green}✓ Your OpenWeather API key is working correctly.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Some API tests failed.${colors.reset}`);
    
    if (!currentWeatherSuccess) {
      console.log(`${colors.red}✗ Current Weather API test failed.${colors.reset}`);
    }
    
    if (!forecastSuccess) {
      console.log(`${colors.red}✗ Forecast API test failed.${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.bold}${colors.cyan}=== Recommendations ===${colors.reset}\n`);
  
  if (currentWeatherSuccess && forecastSuccess) {
    console.log(`${colors.bold}1. Verify Amplify Environment Variables:${colors.reset}`);
    console.log(`   Make sure you've set the OPENWEATHER_API_KEY in your Amplify console:`);
    console.log(`   - Go to AWS Amplify Console > Your App > Environment Variables`);
    console.log(`   - Add OPENWEATHER_API_KEY with your API key value`);
    
    console.log(`\n${colors.bold}2. Check Logs After Deployment:${colors.reset}`);
    console.log(`   After deploying, check the logs in your Amplify console to verify the API calls are working.`);
  } else {
    console.log(`${colors.bold}1. Check API Key:${colors.reset}`);
    console.log(`   - Verify that your API key is correct and active`);
    console.log(`   - Check if you've exceeded your API quota or rate limits`);
    console.log(`   - Try generating a new API key at https://home.openweathermap.org/api_keys`);
    
    console.log(`\n${colors.bold}2. Network Issues:${colors.reset}`);
    console.log(`   - Check your internet connection`);
    console.log(`   - Try the request from a different network or device`);
    console.log(`   - Check if your network blocks API requests to openweathermap.org`);
  }
  
  console.log(`\n${colors.bold}${colors.cyan}=== End of Report ===${colors.reset}`);
} 