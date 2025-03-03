@echo off
echo Committing road conditions UI improvements...

REM Check if Git Bash exists in the default location
if exist "C:\Program Files\Git\bin\bash.exe" (
    echo Using Git Bash to commit changes...
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%cd%' && git add src/components/RoadStatusIndicators.js src/components/ClosuresList.js src/components/cards/RoadClosuresCard.js && git commit -m 'Fix road conditions UI: grid layout for perfect alignment and expanded text boxes' && git push"
) else if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    echo Using Git Bash (x86) to commit changes...
    "C:\Program Files (x86)\Git\bin\bash.exe" -c "cd '%cd%' && git add src/components/RoadStatusIndicators.js src/components/ClosuresList.js src/components/cards/RoadClosuresCard.js && git commit -m 'Fix road conditions UI: grid layout for perfect alignment and expanded text boxes' && git push"
) else (
    echo Git Bash not found. Please commit the changes manually:
    echo.
    echo git add src/components/RoadStatusIndicators.js
    echo git add src/components/ClosuresList.js
    echo git add src/components/cards/RoadClosuresCard.js
    echo git commit -m "Fix road conditions UI: grid layout for perfect alignment and expanded text boxes"
    echo git push
)

echo.
echo Changes made:
echo 1. Completely redesigned status indicators with a grid layout for perfect alignment
echo 2. Increased padding in condition boxes from 3px to 4px for better text display
echo 3. Removed height restrictions on the content area to allow full text display
echo 4. Reduced header padding to provide more space for content
echo.
echo Press any key to continue...
pause 