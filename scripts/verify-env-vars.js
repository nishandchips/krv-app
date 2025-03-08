#!/usr/bin/env node

/**
 * This script verifies that environment variables are properly configured
 * for the Kern River Valley App, particularly for the OpenWeather API.
 */

const fs = require('fs');
const path = require('path');

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

console.log(`${colors.bold}${colors.blue}=== Kern River Valley App Environment Variables Verification ===${colors.reset}\n`);

// Check for .env.local file
console.log(`${colors.bold}Checking .env.local file:${colors.reset}`);
const envLocalPath = path.join(process.cwd(), '.env.local');
let envLocalExists = false;
let envLocalContent = '';

try {
  envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  envLocalExists = true;
  console.log(`${colors.green}✓ .env.local file exists${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}✗ .env.local file not found${colors.reset}`);
}

// Check for OpenWeather API key in .env.local
if (envLocalExists) {
  const hasOpenWeatherKey = envLocalContent.includes('NEXT_PUBLIC_OPENWEATHER_API_KEY=');
  
  if (hasOpenWeatherKey) {
    console.log(`${colors.green}✓ NEXT_PUBLIC_OPENWEATHER_API_KEY found in .env.local${colors.reset}`);
    
    // Check if the key has a value
    const match = envLocalContent.match(/NEXT_PUBLIC_OPENWEATHER_API_KEY=([^\n]*)/);
    if (match && match[1].trim()) {
      console.log(`${colors.green}✓ NEXT_PUBLIC_OPENWEATHER_API_KEY has a value${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ NEXT_PUBLIC_OPENWEATHER_API_KEY is empty${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ NEXT_PUBLIC_OPENWEATHER_API_KEY not found in .env.local${colors.reset}`);
  }
}

// Check for amplify.yml file
console.log(`\n${colors.bold}Checking amplify.yml file:${colors.reset}`);
const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');
let amplifyYmlExists = false;
let amplifyYmlContent = '';

try {
  amplifyYmlContent = fs.readFileSync(amplifyYmlPath, 'utf8');
  amplifyYmlExists = true;
  console.log(`${colors.green}✓ amplify.yml file exists${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}✗ amplify.yml file not found${colors.reset}`);
}

// Check for environment variables configuration in amplify.yml
if (amplifyYmlExists) {
  // Check for environment variables section
  const hasEnvVarsSection = amplifyYmlContent.includes('environmentVariables:');
  
  if (hasEnvVarsSection) {
    console.log(`${colors.green}✓ environmentVariables section found in amplify.yml${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ environmentVariables section not found in amplify.yml${colors.reset}`);
    console.log(`  Add the following to your amplify.yml file:`);
    console.log(`  environmentVariables:`);
    console.log(`    OPENWEATHER_API_KEY: \${OPENWEATHER_API_KEY}`);
    console.log(`    NEXT_PUBLIC_OPENWEATHER_API_KEY: \${OPENWEATHER_API_KEY}`);
  }
  
  // Check for OpenWeather API key in environment variables
  const hasOpenWeatherKey = amplifyYmlContent.includes('OPENWEATHER_API_KEY:');
  
  if (hasOpenWeatherKey) {
    console.log(`${colors.green}✓ OPENWEATHER_API_KEY found in amplify.yml${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ OPENWEATHER_API_KEY not found in amplify.yml${colors.reset}`);
    console.log(`    OPENWEATHER_API_KEY: \${OPENWEATHER_API_KEY}`);
  }
  
  // Check for .env.production file creation in preBuild
  const hasEnvProductionCreation = amplifyYmlContent.includes('.env.production');
  
  if (hasEnvProductionCreation) {
    console.log(`${colors.green}✓ .env.production file creation found in preBuild section${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ .env.production file creation not found in preBuild section${colors.reset}`);
    console.log(`  Add the following to your amplify.yml file's preBuild section:`);
    console.log(`  preBuild:`);
    console.log(`    commands:`);
    console.log(`      - npm install`);
    console.log(`      # Create a .env.production file with environment variables`);
    console.log(`      - echo "OPENWEATHER_API_KEY=\${OPENWEATHER_API_KEY}" >> .env.production`);
    console.log(`      - echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=\${OPENWEATHER_API_KEY}" >> .env.production`);
  }
}

// Check for next.config.js file
console.log(`\n${colors.bold}Checking next.config.js file:${colors.reset}`);
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
let nextConfigExists = false;
let nextConfigContent = '';

try {
  nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  nextConfigExists = true;
  console.log(`${colors.green}✓ next.config.js file exists${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}! next.config.js file not found${colors.reset}`);
  console.log(`  This is optional but can help with environment variables.`);
}

// Check for serverRuntimeConfig in next.config.js
if (nextConfigExists) {
  const hasServerRuntimeConfig = nextConfigContent.includes('serverRuntimeConfig');
  
  if (hasServerRuntimeConfig) {
    console.log(`${colors.green}✓ serverRuntimeConfig found in next.config.js${colors.reset}`);
  } else {
    console.log(`${colors.yellow}! serverRuntimeConfig not found in next.config.js${colors.reset}`);
    console.log(`  Consider adding the following to your next.config.js file:`);
    console.log(`  module.exports = {`);
    console.log(`    serverRuntimeConfig: {`);
    console.log(`      // Will only be available on the server side`);
    console.log(`      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,`);
    console.log(`    },`);
    console.log(`    // ... other config`);
    console.log(`  };`);
  }
}

// Summary and next steps
console.log(`\n${colors.bold}${colors.blue}=== Summary ===${colors.reset}`);

if (!envLocalExists) {
  console.log(`${colors.yellow}! Create a .env.local file with your API keys for local development${colors.reset}`);
  console.log(`  NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here`);
}

if (!amplifyYmlExists) {
  console.log(`${colors.yellow}! Create an amplify.yml file for your AWS Amplify deployment${colors.reset}`);
} else if (!amplifyYmlContent.includes('.env.production')) {
  console.log(`${colors.yellow}! Update your amplify.yml file to create a .env.production file during build${colors.reset}`);
}

console.log(`\n${colors.bold}${colors.blue}=== Next Steps ===${colors.reset}`);
console.log(`1. Make sure you've set the OPENWEATHER_API_KEY in your AWS Amplify console:`);
console.log(`   - Go to AWS Amplify Console > Your App > Hosting environments > Environment variables`);
console.log(`   - Add OPENWEATHER_API_KEY with your API key value`);
console.log(`2. Update your amplify.yml file as suggested above`);
console.log(`3. Redeploy your application`);
console.log(`4. Check the build logs for any errors`);

console.log(`\n${colors.bold}${colors.green}Done!${colors.reset}`); 