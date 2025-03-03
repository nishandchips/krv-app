# Custom Background Images

Place your custom background images in this directory.

## Current Background Image

The application is configured to use `kern-river-background.jpg` as the background image. You can:

1. Add an image with this exact filename
2. Or change the filename in `src/components/DynamicBackground.js`

## Recommended Image Specifications

- **Resolution**: At least 1920x1080 pixels for good quality on most displays
- **Format**: JPG or WebP (for better compression)
- **Size**: Keep under 500KB if possible for faster loading
- **Content**: Landscape orientation images of the Kern River Valley work best

## Privacy: Stripping EXIF Data

For privacy reasons, it's recommended to strip EXIF data from your images before using them. EXIF data can contain sensitive information like GPS coordinates, camera details, and timestamps.

### Using the Built-in EXIF Stripping Tool

This project includes a tool to strip EXIF data from your images:

#### For Windows Users:

1. Install the required dependency:
   ```
   npm install
   ```

2. Run the Windows-specific EXIF stripping tool:
   ```
   npm run strip-exif-win -- "C:\path\to\your\image.jpg" "C:\path\to\output\kern-river-background.jpg"
   ```
   
   Or use the batch file (easier):
   ```
   scripts\strip-exif-win.bat "C:\path\to\your\image.jpg" "C:\path\to\output\kern-river-background.jpg"
   ```

   This will create a copy of your image with all EXIF data removed.

3. To overwrite the original file, omit the output path:
   ```
   npm run strip-exif-win -- "C:\path\to\your\image.jpg"
   ```

#### For Linux/Mac/WSL Users:

1. Install the required dependency:
   ```
   npm install
   ```

2. Run the EXIF stripping tool:
   ```
   npm run strip-exif -- /path/to/your/image.jpg /path/to/output/kern-river-background.jpg
   ```
   
   Or use the shell script (easier):
   ```
   ./scripts/strip-exif.sh /path/to/your/image.jpg /path/to/output/kern-river-background.jpg
   ```

   This will create a copy of your image with all EXIF data removed.

3. To overwrite the original file, omit the output path:
   ```
   npm run strip-exif -- /path/to/your/image.jpg
   ```

### Alternative Methods

You can also use:
- Image editing software like Photoshop, GIMP, or Paint.NET
- Online tools (though be cautious about uploading sensitive images to third-party services)
- Command-line tools like ExifTool

## Example Sources

Good sources for Kern River Valley images include:
- Your own photos (with EXIF data removed)
- Public domain images
- Licensed stock photos (ensure you have proper rights)

## How to Change the Background

To use a different image:

1. Add your image to this directory (after stripping EXIF data)
2. Open `src/components/DynamicBackground.js`
3. Update the `customBackgroundImage` variable with your image path:

```javascript
const customBackgroundImage = "/images/your-image-filename.jpg";
``` 