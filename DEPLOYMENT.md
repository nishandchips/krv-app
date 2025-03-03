# Deployment Guide for Kern River Valley App

This guide will help you commit your changes and deploy the application properly.

## Committing Changes with Git

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

### Using the Helper Script

Alternatively, you can use the helper script we created:

1. Open your WSL terminal.

2. Navigate to your project directory:
   ```bash
   cd /mnt/c/Users/nadel/Documents/krv-app
   ```

3. Make the script executable:
   ```bash
   chmod +x scripts/git-push.sh
   ```

4. Run the script with your commit message:
   ```bash
   ./scripts/git-push.sh "Add background image and center view toggle buttons"
   ```

## Troubleshooting Git Issues

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

## Common Deployment Issues

### Images Not Showing Up

1. **File Path Issues**: Make sure the image paths in your code match the actual file paths in your repository.

2. **Case Sensitivity**: Some hosting platforms are case-sensitive. Ensure the case of your file paths matches exactly.

3. **Build Process**: Some hosting platforms might not include certain files in the build process. Check your build configuration.

### CSS Changes Not Applying

1. **Cache Issues**: Try clearing your browser cache or using incognito mode to view the site.

2. **Build Process**: Make sure your CSS changes are being included in the build process.

## Hosting Platform Specific Instructions

### Vercel

1. Go to your Vercel dashboard.
2. Select your project.
3. Check the "Deployments" tab to see if your latest deployment was successful.
4. If there were errors, check the build logs for details.

### Netlify

1. Go to your Netlify dashboard.
2. Select your project.
3. Check the "Deploys" tab to see if your latest deployment was successful.
4. If there were errors, check the build logs for details.

### AWS Amplify

1. Go to your AWS Amplify console.
2. Select your app.
3. Check the "Hosting" tab to see if your latest deployment was successful.
4. If there were errors, check the build logs for details. 