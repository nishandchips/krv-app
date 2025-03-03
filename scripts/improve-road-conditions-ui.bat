@echo off
echo Starting road conditions UI improvement commit process...
echo.
echo Changes made:
echo 1. Implemented fixed-height containers for perfect vertical alignment
echo 2. Added fixed width to highway columns to ensure consistent sizing
echo 3. Improved text display with break-words and removed truncation
echo 4. Changed overflow handling to visible to ensure all content displays
echo.

REM Try to locate Git Bash in common locations
set GITBASH="C:\Program Files\Git\bin\bash.exe"
if not exist %GITBASH% (
  set GITBASH="C:\Program Files (x86)\Git\bin\bash.exe"
)

REM If Git Bash exists, use it to commit
if exist %GITBASH% (
  echo Using Git Bash to commit changes...
  %GITBASH% -c "cd '%~dp0..' && git add src/components/RoadStatusIndicators.js src/components/ClosuresList.js src/components/cards/RoadClosuresCard.js && git commit -m 'Fix road conditions UI: implement fixed-height bounding boxes for perfect alignment' && git push"
) else (
  echo Git Bash not found. Please commit manually with these commands:
  echo.
  echo cd %~dp0..
  echo git add src/components/RoadStatusIndicators.js src/components/ClosuresList.js src/components/cards/RoadClosuresCard.js
  echo git commit -m "Fix road conditions UI: implement fixed-height bounding boxes for perfect alignment"
  echo git push
)

echo.
echo Process completed. Please check for any errors above.
pause 