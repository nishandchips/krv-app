@echo off
echo Committing road conditions UI improvements...

REM Check if Git Bash exists in the default location
if exist "C:\Program Files\Git\bin\bash.exe" (
    echo Using Git Bash to commit changes...
    "C:\Program Files\Git\bin\bash.exe" -c "cd '%cd%' && git add src/components/RoadStatusIndicators.js src/components/ClosuresList.js src/components/cards/RoadClosuresCard.js && git commit -m 'Fix road conditions UI: align status lights and prevent text truncation' && git push"
) else if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    echo Using Git Bash (x86) to commit changes...
    "C:\Program Files (x86)\Git\bin\bash.exe" -c "cd '%cd%' && git add src/components/RoadStatusIndicators.js src/components/ClosuresList.js src/components/cards/RoadClosuresCard.js && git commit -m 'Fix road conditions UI: align status lights and prevent text truncation' && git push"
) else (
    echo Git Bash not found. Please commit the changes manually:
    echo.
    echo git add src/components/RoadStatusIndicators.js
    echo git add src/components/ClosuresList.js
    echo git add src/components/cards/RoadClosuresCard.js
    echo git commit -m "Fix road conditions UI: align status lights and prevent text truncation"
    echo git push
)

echo.
echo Changes made:
echo 1. Fixed vertical alignment of status lights with fixed-height containers
echo 2. Improved text display in condition boxes with better overflow handling
echo 3. Increased padding in condition boxes for better readability
echo 4. Adjusted card spacing to provide more room for content
echo.
echo Press any key to continue...
pause 