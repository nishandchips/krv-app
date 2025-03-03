# Deployment Guide for Kern River Valley App

This guide will help you commit your changes and deploy the application properly, with a focus on ensuring the background image is included.

## Preparing Your Application

1. **Verify Your Background Image**

   Make sure your background image is in the correct location:
   ```
   public/images/kern-river-background.jpg
   ```

   You can run the check-image script to verify:
   ```
   npm run check-image
   ```

2. **Build Your Application**

   Build your application to make sure everything is working correctly:
   ```
   npm run build
   ```

   If the build fails, check the error messages and fix any issues.

## Committing Your Changes

Since Git is not working in PowerShell but is available in WSL, follow these steps to commit your changes:

### Using WSL (Windows Subsystem for Linux)

1. Open your WSL terminal.

2. Navigate to your project directory:
   ```bash
   cd /mnt/c/Users/nadel/Documents/krv-app
   ```

3. Check the status of your changes:
   ```bash
   git status
   ```

4. Make sure all your files, including images, are being tracked:
   ```bash
   git add .
   ```

5. Commit your changes:
   ```bash
   git commit -m "Add background image and center view toggle buttons"
   ```

6. Push your changes to GitHub:
   ```bash
   git push
   ```

### Troubleshooting Git Issues

If you're having issues with Git not tracking certain files:

1. Check if the files are being ignored by Git:
   ```bash
   git check-ignore -v public/images/kern-river-background.jpg
   ```

2. If the files are being ignored, you can force Git to track them:
   ```bash
   git add -f public/images/kern-river-background.jpg
   ```

3. For large files (over 100MB), you might need to use Git LFS (Large File Storage).

## Verifying Your Deployment

After pushing your changes:

1. Wait a few minutes for your hosting platform to build and deploy the changes.

2. Check your deployed site to see if the changes are visible.

3. If the changes are not visible, check the build logs on your hosting platform for any errors.

## Common Deployment Issues and Solutions

### Images Not Showing Up

1. **Check if the image is being included in the build**

   Run the check-image script:
   ```
   npm run check-image
   ```

2. **Verify the image path in your code**

   Make sure the path in `src/components/DynamicBackground.js` is correct:
   ```javascript
   const customBackgroundImage = "/images/kern-river-background.jpg";
   ```

3. **Check if the image is being committed to Git**

   In WSL, run:
   ```bash
   git ls-files public/images/
   ```

   If the image is not listed, add it:
   ```bash
   git add -f public/images/kern-river-background.jpg
   ```

4. **Check if the image is too large**

   GitHub has a file size limit of 100MB. If your image is larger, consider compressing it or using Git LFS.

5. **Verify the image is being served by your hosting platform**

   Check the network tab in your browser's developer tools to see if the image is being requested and what the response is.

### CSS Changes Not Applying

1. **Clear your browser cache**

   Try clearing your browser cache or using incognito mode to view the site.

2. **Check if the CSS changes are being included in the build**

   Make sure your CSS changes are being included in the build process.

## Hosting Platform Specific Instructions

### AWS Amplify

1. Go to your AWS Amplify console.
2. Select your app.
3. Check the "Hosting" tab to see if your latest deployment was successful.
4. If there were errors, check the build logs for details.
5. If the deployment was successful but the image is not showing, check the "Advanced settings" and make sure the "Public directory" is set to "public".

### Vercel

1. Go to your Vercel dashboard.
2. Select your project.
3. Check the "Deployments" tab to see if your latest deployment was successful.
4. If there were errors, check the build logs for details.
5. If the deployment was successful but the image is not showing, check the "Settings" > "Build & Development Settings" and make sure the "Public Directory" is set to "public".

### Netlify

1. Go to your Netlify dashboard.
2. Select your project.
3. Check the "Deploys" tab to see if your latest deployment was successful.
4. If there were errors, check the build logs for details.
5. If the deployment was successful but the image is not showing, check the "Site settings" > "Build & deploy" > "Asset optimization" and make sure it's not interfering with your images.

## Final Checklist

Before considering your deployment complete, check the following:

- [ ] The application builds successfully with `npm run build`
- [ ] All files, including images, are committed to Git
- [ ] Changes are pushed to GitHub
- [ ] The deployment is successful on your hosting platform
- [ ] The background image is visible on the deployed site
- [ ] The view toggle buttons are centered
- [ ] All other functionality works as expected 