# AWS Amplify Environment Variables Guide

This guide explains how to properly configure environment variables in AWS Amplify for your Kern River Valley App.

## Current Issue

Based on the console logs, it appears that the environment variables set in the Amplify console are not being properly passed to your Next.js API routes. This is a common issue with Amplify and Next.js applications.

## Solution

### 1. Hardcoded Fallback (Immediate Fix)

We've implemented a hardcoded fallback in your API routes that will use the API key directly if it can't be accessed through environment variables. This should fix the immediate issue.

### 2. Proper Environment Variable Configuration

For a more robust solution, follow these steps to ensure your environment variables are properly configured:

#### Update your amplify.yml file

Make sure your `amplify.yml` file includes both the server-side and client-side environment variables:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm install
        - npm run build
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
    secondaryArtifacts:
      - baseDirectory: public
        files:
          - '**/*'
        destination: /public
  cache:
    paths:
      - node_modules/**/*
  
  # Environment variables - IMPORTANT
  environmentVariables:
    OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
    NEXT_PUBLIC_OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
```

#### Set Environment Variables in Amplify Console

1. Go to AWS Amplify Console > Your App > Environment Variables
2. Make sure you have the following variables set:
   - `OPENWEATHER_API_KEY` with your API key value
   - `NEXT_PUBLIC_OPENWEATHER_API_KEY` with the same API key value

#### Verify Environment Variables in Build Logs

After deploying, check the build logs to see if your environment variables are being properly set:

1. Go to AWS Amplify Console > Your App > Hosting > Latest deployment
2. Click on "Deployment details" > "View logs"
3. Look for any messages related to environment variables

## How Next.js Handles Environment Variables

Next.js has specific rules for environment variables:

- Variables prefixed with `NEXT_PUBLIC_` are available in both client and server code
- Other variables are only available in server-side code (API routes, getServerSideProps, etc.)
- In production builds, environment variables are embedded at build time

## Troubleshooting

### Check Available Environment Variables

Our updated code now logs available environment variables (excluding sensitive ones). Look for these logs in your Amplify console to see what variables are actually available to your application.

### Direct API Access

Try accessing your API routes directly to see the raw response:

- `https://your-amplify-domain.com/api/weather`
- `https://your-amplify-domain.com/api/weather-forecast`

### Environment Variable Precedence

Next.js loads environment variables in the following order:

1. `.env.$(NODE_ENV).local`
2. `.env.local`
3. `.env.$(NODE_ENV)`
4. `.env`

In Amplify, the environment variables set in the console should override these files.

## Alternative Approaches

If you continue to have issues with environment variables in Amplify, consider these alternatives:

### 1. Use AWS Parameter Store

Store your API keys in AWS Parameter Store and access them in your API routes:

```javascript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({ region: "us-west-2" });
const command = new GetParameterCommand({
  Name: "/myapp/openweather-api-key",
  WithDecryption: true,
});

const response = await ssmClient.send(command);
const apiKey = response.Parameter.Value;
```

### 2. Use AWS Secrets Manager

Similar to Parameter Store but designed specifically for secrets:

```javascript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-west-2" });
const command = new GetSecretValueCommand({ SecretId: "openweather-api-key" });
const response = await client.send(command);
const apiKey = response.SecretString;
```

### 3. Use Next.js Runtime Configuration

Configure your API keys at runtime instead of build time:

```javascript
// next.config.js
module.exports = {
  serverRuntimeConfig: {
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  },
  publicRuntimeConfig: {
    // Add public variables here
  },
}
```

Then access them in your code:

```javascript
import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();
const apiKey = serverRuntimeConfig.openWeatherApiKey;
``` 