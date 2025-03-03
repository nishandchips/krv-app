#!/usr/bin/env node

/**
 * AWS Amplify Configuration Checker for Weather API
 * 
 * This script helps verify that your environment variables and configuration
 * are properly set up for the Weather API in your Amplify deployment.
 * 
 * Usage:
 *   node scripts/check-amplify-config.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log(`${colors.bold}${colors.cyan}=== Kern River Valley App - Amplify Configuration Checker ===${colors.reset}\n`);

// Check for .env.local file
console.log(`${colors.bold}Checking local environment variables...${colors.reset}`);
try {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const hasOpenWeatherKey = envContent.includes('NEXT_PUBLIC_OPENWEATHER_API_KEY=');
    
    if (hasOpenWeatherKey) {
      console.log(`${colors.green}✓ NEXT_PUBLIC_OPENWEATHER_API_KEY found in .env.local${colors.reset}`);
      
      // Check if the key is not empty
      const match = envContent.match(/NEXT_PUBLIC_OPENWEATHER_API_KEY=([^\n]*)/);
      if (match && match[1].trim()) {
        console.log(`${colors.green}✓ NEXT_PUBLIC_OPENWEATHER_API_KEY has a value${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ NEXT_PUBLIC_OPENWEATHER_API_KEY is empty${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ NEXT_PUBLIC_OPENWEATHER_API_KEY not found in .env.local${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}! .env.local file not found${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error checking .env.local: ${error.message}${colors.reset}`);
}

// Check for amplify.yml file
console.log(`\n${colors.bold}Checking Amplify configuration...${colors.reset}`);
try {
  const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');
  if (fs.existsSync(amplifyYmlPath)) {
    const amplifyContent = fs.readFileSync(amplifyYmlPath, 'utf8');
    const hasOpenWeatherKey = amplifyContent.includes('OPENWEATHER_API_KEY');
    
    if (hasOpenWeatherKey) {
      console.log(`${colors.green}✓ OPENWEATHER_API_KEY found in amplify.yml${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ OPENWEATHER_API_KEY not found in amplify.yml${colors.reset}`);
      console.log(`${colors.yellow}  Add the following to your amplify.yml under environmentVariables:${colors.reset}`);
      console.log(`    OPENWEATHER_API_KEY: \${OPENWEATHER_API_KEY}`);
    }
  } else {
    console.log(`${colors.yellow}! amplify.yml file not found${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error checking amplify.yml: ${error.message}${colors.reset}`);
}

// Check next.config.mjs for environment variables
console.log(`\n${colors.bold}Checking Next.js configuration...${colors.reset}`);
try {
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    const hasEnvConfig = nextConfigContent.includes('env:') || 
                         nextConfigContent.includes('publicRuntimeConfig:') || 
                         nextConfigContent.includes('serverRuntimeConfig:');
    
    if (hasEnvConfig) {
      console.log(`${colors.green}✓ Environment configuration found in next.config.mjs${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! No explicit environment configuration in next.config.mjs${colors.reset}`);
      console.log(`${colors.yellow}  This is fine if you're using .env files or Amplify environment variables${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}! next.config.mjs file not found${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error checking next.config.mjs: ${error.message}${colors.reset}`);
}

// Check for AWS CLI and Amplify CLI
console.log(`\n${colors.bold}Checking AWS CLI and Amplify CLI...${colors.reset}`);
try {
  execSync('aws --version', { stdio: 'ignore' });
  console.log(`${colors.green}✓ AWS CLI is installed${colors.reset}`);
  
  try {
    // Try to get the Amplify app list to check if credentials are configured
    execSync('aws amplify list-apps --output json', { stdio: 'ignore' });
    console.log(`${colors.green}✓ AWS credentials appear to be configured${colors.reset}`);
  } catch (e) {
    console.log(`${colors.yellow}! AWS credentials may not be configured correctly${colors.reset}`);
    console.log(`${colors.yellow}  Run 'aws configure' to set up your credentials${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.yellow}! AWS CLI is not installed or not in PATH${colors.reset}`);
  console.log(`${colors.yellow}  Install AWS CLI to manage your Amplify app: https://aws.amazon.com/cli/${colors.reset}`);
}

// Check for the weather API files
console.log(`\n${colors.bold}Checking Weather API implementation...${colors.reset}`);
const apiFiles = [
  'src/app/api/weather/route.js',
  'src/app/api/weather-forecast/route.js',
  'src/lib/weather.js',
  'src/lib/weatherForecast.js'
];

apiFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`${colors.green}✓ ${file} exists${colors.reset}`);
    
    // Check for debugging code
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('console.log(')) {
      console.log(`${colors.green}  ✓ Debugging logs found in ${file}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}  ! No debugging logs found in ${file}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ ${file} not found${colors.reset}`);
  }
});

// Provide recommendations
console.log(`\n${colors.bold}${colors.cyan}=== Recommendations ===${colors.reset}\n`);
console.log(`${colors.bold}1. Amplify Environment Variables:${colors.reset}`);
console.log(`   Make sure you've set the OPENWEATHER_API_KEY in your Amplify console:`);
console.log(`   - Go to AWS Amplify Console > Your App > Environment Variables`);
console.log(`   - Add OPENWEATHER_API_KEY with your API key value`);

console.log(`\n${colors.bold}2. Verify API Key:${colors.reset}`);
console.log(`   Test your OpenWeather API key with this URL (replace YOUR_API_KEY):`);
console.log(`   https://api.openweathermap.org/data/2.5/weather?lat=35.6688&lon=-118.2912&appid=YOUR_API_KEY&units=imperial`);

console.log(`\n${colors.bold}3. Check Logs After Deployment:${colors.reset}`);
console.log(`   After deploying, check the logs in your Amplify console:`);
console.log(`   - Go to AWS Amplify Console > Your App > Hosting > Latest deployment`);
console.log(`   - Click on "Deployment details" > "View logs"`);

console.log(`\n${colors.bold}4. Test API Endpoints:${colors.reset}`);
console.log(`   After deploying, test these endpoints in your browser:`);
console.log(`   - https://your-amplify-domain.com/api/weather`);
console.log(`   - https://your-amplify-domain.com/api/weather-forecast`);

console.log(`\n${colors.bold}${colors.cyan}=== End of Report ===${colors.reset}`); 