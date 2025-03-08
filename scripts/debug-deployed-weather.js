#!/usr/bin/env node

/**
 * This script tests the deployed weather API to help debug issues
 * with the weather API in the Kern River Valley App.
 */

const https = require('https');
const readline = require('readline');

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

console.log(`${colors.bold}${colors.blue}=== Kern River Valley App Deployed Weather API Debug ===${colors.reset}\n`);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for the deployed URL
rl.question('Enter your deployed app URL (e.g., https://your-app.amplifyapp.com): ', (deployedUrl) => {
  // Remove trailing slash if present
  deployedUrl = deployedUrl.endsWith('/') ? deployedUrl.slice(0, -1) : deployedUrl;
  
  console.log(`\n${colors.bold}Testing deployed weather API at ${deployedUrl}${colors.reset}`);
  
  // Test the weather API
  const weatherUrl = `${deployedUrl}/api/weather?lat=35.6688&lon=-118.2912`;
  console.log(`\n${colors.bold}Testing weather API:${colors.reset}`);
  console.log(`Making request to: ${weatherUrl}`);
  
  https.get(weatherUrl, (res) => {
    let data = '';
    
    console.log(`Response status code: ${res.statusCode}`);
    console.log(`Response headers:`, res.headers);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`${colors.green}API request successful!${colors.reset}`);
        try {
          const parsedData = JSON.parse(data);
          console.log(`\nWeather data received:`);
          console.log(JSON.stringify(parsedData, null, 2));
          
          // Check if the data has the required fields
          if (parsedData.temp !== undefined) {
            console.log(`\n${colors.green}✓ Weather data has temperature field${colors.reset}`);
          } else {
            console.log(`\n${colors.red}✗ Weather data is missing temperature field${colors.reset}`);
          }
          
          if (parsedData.error) {
            console.log(`\n${colors.red}✗ Weather data contains an error: ${parsedData.error}${colors.reset}`);
          }
          
          // Test the weather forecast API
          testWeatherForecastApi(deployedUrl);
        } catch (error) {
          console.log(`${colors.red}Error parsing API response:${colors.reset}`, error);
          console.log(`Raw response: ${data}`);
          rl.close();
        }
      } else {
        console.log(`${colors.red}API request failed with status code ${res.statusCode}${colors.reset}`);
        console.log(`Response: ${data}`);
        rl.close();
      }
    });
  }).on('error', (error) => {
    console.log(`${colors.red}Error making API request:${colors.reset}`, error);
    rl.close();
  });
});

function testWeatherForecastApi(deployedUrl) {
  const forecastUrl = `${deployedUrl}/api/weather-forecast?lat=35.6688&lon=-118.2912`;
  console.log(`\n${colors.bold}Testing weather forecast API:${colors.reset}`);
  console.log(`Making request to: ${forecastUrl}`);
  
  https.get(forecastUrl, (res) => {
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
          console.log(`\nWeather forecast data received:`);
          
          if (Array.isArray(parsedData)) {
            console.log(`Received ${parsedData.length} forecast items`);
            console.log(JSON.stringify(parsedData.slice(0, 2), null, 2) + '...');
            console.log(`\n${colors.green}✓ Weather forecast data is an array${colors.reset}`);
          } else {
            console.log(JSON.stringify(parsedData, null, 2));
            console.log(`\n${colors.red}✗ Weather forecast data is not an array${colors.reset}`);
            
            if (parsedData.error) {
              console.log(`\n${colors.red}✗ Weather forecast data contains an error: ${parsedData.error}${colors.reset}`);
            }
          }
          
          console.log(`\n${colors.bold}${colors.blue}=== Debugging Recommendations ===${colors.reset}`);
          console.log(`1. Check that OPENWEATHER_API_KEY is set in your AWS Amplify environment variables`);
          console.log(`2. Verify that your amplify.yml file is properly configured to pass environment variables to Next.js API routes`);
          console.log(`3. Check the AWS Amplify build logs for any errors related to environment variables`);
          console.log(`4. Try rebuilding and redeploying your application`);
          
          rl.close();
        } catch (error) {
          console.log(`${colors.red}Error parsing API response:${colors.reset}`, error);
          console.log(`Raw response: ${data}`);
          rl.close();
        }
      } else {
        console.log(`${colors.red}API request failed with status code ${res.statusCode}${colors.reset}`);
        console.log(`Response: ${data}`);
        rl.close();
      }
    });
  }).on('error', (error) => {
    console.log(`${colors.red}Error making API request:${colors.reset}`, error);
    rl.close();
  });
} 