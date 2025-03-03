#!/bin/bash

echo "EXIF Data Stripping Tool"
echo "----------------------"

if [ -z "$1" ]; then
  echo "Error: Please provide an input image path."
  echo "Usage: ./strip-exif.sh input-image [output-image]"
  exit 1
fi

# Pass arguments directly to the Node.js script
# The script now handles Windows path conversion internally
npm run strip-exif -- "$@"

echo ""
echo "Done!" 