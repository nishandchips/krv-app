# Kern River Valley App

A real-time dashboard for the Kern River Valley, providing information on:
- Lake Isabella storage levels
- North and South Fork Kern River flow rates
- Local weather conditions and forecasts
- Road closures for Highways 178 and 155

## Features

- Responsive design for both mobile and desktop viewing
- Multiple data sources including USACE, USGS, and weather APIs
- Real-time data with automatic and manual refresh options
- Interactive charts for river flow and lake storage data
- Toggle between tiled view (all cards) and single card view
- Custom background image support with EXIF data stripping for privacy

## Technologies Used

- Next.js
- React
- Tailwind CSS
- Recharts for data visualization
- Server-side API integration
- Sharp for image processing

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/krv-app.git
cd krv-app
```

2. Install dependencies
```
npm install
```

3. Add a custom background image (optional)
```
# Add your image to the public/images directory

# Strip EXIF data for privacy (recommended)
# For Windows:
npm run strip-exif-win -- "C:\path\to\your\image.jpg" "public\images\kern-river-background.jpg"
# OR use the batch file:
scripts\strip-exif-win.bat "C:\path\to\your\image.jpg" "public\images\kern-river-background.jpg"

# For Linux/Mac/WSL:
npm run strip-exif -- /path/to/your/image.jpg public/images/kern-river-background.jpg
# OR use the shell script:
./scripts/strip-exif.sh /path/to/your/image.jpg public/images/kern-river-background.jpg
```

4. Run the development server
```
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Custom Background Image

The app supports using your own background image:

1. Place your image in the `public/images` directory
2. For privacy, strip EXIF data using the included tool:
   ```
   # For Windows:
   npm run strip-exif-win -- "C:\path\to\your\image.jpg" "public\images\kern-river-background.jpg"
   
   # For Linux/Mac/WSL:
   npm run strip-exif -- /path/to/your/image.jpg public/images/kern-river-background.jpg
   ```
3. See `public/images/README.md` for more details

## Deployment

This application can be deployed to Vercel, Netlify, or any other hosting platform that supports Next.js.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by US Army Corps of Engineers and US Geological Survey
- Weather data from OpenWeatherMap API
