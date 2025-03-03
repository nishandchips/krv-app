@echo off
echo EXIF Data Stripping Tool for Windows
echo ----------------------

if "%~1"=="" (
  echo Error: Please provide an input image path.
  echo Usage: strip-exif-win.bat input-image [output-image]
  exit /b 1
)

set INPUT_PATH=%~1
set OUTPUT_PATH=%~2

if "%OUTPUT_PATH%"=="" (
  set OUTPUT_PATH=%INPUT_PATH%
)

echo Processing: %INPUT_PATH%
echo Output: %OUTPUT_PATH%

call npm run strip-exif-win -- "%INPUT_PATH%" "%OUTPUT_PATH%"

echo.
echo Done!
pause 