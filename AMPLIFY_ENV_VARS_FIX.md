# Fixing Environment Variables in AWS Amplify for Next.js API Routes

The issue you're experiencing with the OpenWeather API key not being accessible in your Next.js API routes is a common problem when deploying Next.js applications on AWS Amplify. Here's how to fix it:

## The Problem

Environment variables set in the AWS Amplify console are not automatically passed to Next.js API routes (server-side code). They are only available during the build process and to client-side code with the `NEXT_PUBLIC_` prefix.

## The Solution

### 1. Update your `amplify.yml` file

Your current `amplify.yml` file has environment variables defined, but they need to be properly configured to be available to Next.js API routes. Update your `amplify.yml` file to include the following:

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
        # Create a .env.production file with environment variables
        - echo "OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}" >> .env.production
        - echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}" >> .env.production
        - echo "UNSPLASH_ACCESS_KEY=${UNSPLASH_ACCESS_KEY}" >> .env.production
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
    # Explicitly include the public directory
    secondaryArtifacts:
      - baseDirectory: public
        files:
          - '**/*'
        destination: /public
  cache:
    paths:
      - node_modules/**/*
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains'
        - key: 'X-Content-Type-Options'
          value: 'nosniff'
        - key: 'X-Frame-Options'
          value: 'SAMEORIGIN'
        - key: 'X-XSS-Protection'
          value: '1; mode=block'
  
  # Environment variables
  environmentVariables:
    OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
    NEXT_PUBLIC_OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
    UNSPLASH_ACCESS_KEY: ${UNSPLASH_ACCESS_KEY}
```

The key change is adding these lines to the `preBuild` section:
```yaml
# Create a .env.production file with environment variables
- echo "OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}" >> .env.production
- echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}" >> .env.production
- echo "UNSPLASH_ACCESS_KEY=${UNSPLASH_ACCESS_KEY}" >> .env.production
```

This creates a `.env.production` file during the build process that Next.js will use for server-side environment variables.

### 2. Verify Environment Variables in AWS Amplify Console

1. Go to the AWS Amplify Console
2. Select your app
3. Go to "Hosting environments" > "Environment variables"
4. Verify that `OPENWEATHER_API_KEY` is set with your API key
5. If it's not set, add it with your OpenWeather API key

### 3. Redeploy Your Application

After making these changes, redeploy your application:

1. Commit and push the updated `amplify.yml` file to your repository
2. AWS Amplify will automatically detect the changes and start a new build
3. Monitor the build logs to ensure the environment variables are being set correctly

## Troubleshooting

If you're still experiencing issues after making these changes:

1. Check the build logs in the AWS Amplify Console for any errors
2. Verify that the `.env.production` file is being created during the build process
3. Add more logging to your API routes to debug the environment variables:

```javascript
console.log('All env vars (safe keys only):', 
  Object.keys(process.env)
    .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN'))
    .join(', ')
);
```

## Alternative Approach: Runtime Configuration

If the above solution doesn't work, you can try using Next.js Runtime Configuration:

1. Create a file called `next.config.js` in your project root (if it doesn't exist already)
2. Add the following code:

```javascript
module.exports = {
  serverRuntimeConfig: {
    // Will only be available on the server side
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
};
```

3. Update your API routes to use the runtime config:

```javascript
import getConfig from 'next/config';

export async function GET(request) {
  const { serverRuntimeConfig } = getConfig();
  const apiKey = serverRuntimeConfig.openWeatherApiKey;
  
  // Rest of your code...
}
```

I hope this helps you resolve the environment variables issue! 