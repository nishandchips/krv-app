@echo off
echo Kern River Valley App Deployment Helper
echo --------------------------------------

:: Check if we're in the right directory
if not exist "package.json" (
  echo Error: This script must be run from the project root directory.
  echo Please navigate to the project root and try again.
  exit /b 1
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Build the application
echo Building the application...
call npm run build

:: Verify that the build was successful
echo Verifying build...
if exist ".next\static" (
  echo ✅ Build successful!
) else (
  echo ❌ Build failed or incomplete. Check for errors above.
  exit /b 1
)

:: Check for the background image
echo Checking for background image...
if exist "public\images\kern-river-background.jpg" (
  echo ✅ Background image found!
) else (
  echo ⚠️ Warning: Background image not found at public\images\kern-river-background.jpg
  echo    The application will use the fallback gradient background.
)

:: Prepare for deployment
echo.
echo Your application is ready for deployment!
echo.
echo To deploy to your hosting platform:
echo.
echo 1. If you have Git working in PowerShell, commit your changes:
echo    git add .
echo    git commit -m "Prepare for deployment"
echo    git push
echo.
echo 2. If Git is not working in PowerShell, use WSL:
echo    Open WSL and navigate to your project:
echo    cd /mnt/c/Users/nadel/Documents/krv-app
echo    Then commit and push:
echo    git add .
echo    git commit -m "Prepare for deployment"
echo    git push
echo.
echo 3. Your hosting platform should automatically detect the changes and start a new build.
echo.
echo 4. Check your hosting platform's dashboard for build status and any errors.
echo.
echo Done!
pause 