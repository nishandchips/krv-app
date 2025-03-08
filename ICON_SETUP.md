# KRV.APP Icon Setup

This document explains how to set up and generate the icons for the Kern River Valley App.

## Icon Files

The app uses the following icon files:

- `public/favicon.svg` - Vector icon used as the primary favicon
- `public/icon-{size}.png` - PNG icons in various sizes (16, 32, 48, 64, 96, 128, 192, 256, 384, 512)
- `public/apple-touch-icon.png` - Special icon for iOS devices (180x180)
- `public/manifest.json` - Web app manifest file for PWA support

## Generating Icons

To generate all the necessary icon files from the SVG:

1. Make sure you have the required dependencies:
   ```bash
   npm install sharp
   ```

2. Run the icon generation script:
   ```bash
   node scripts/generate-icons.js
   ```

This will create all the PNG icons in various sizes based on the SVG file.

## Icon Design

The icon is a simple mountain with a lake design:
- Blue background representing the sky
- Gray mountains with white snow caps
- Blue wave at the bottom representing the lake/river

## How Icons Are Used

- **Favicon**: The icon shown in browser tabs
- **Home Screen Icon**: The icon shown when users add the app to their home screen
- **App Icon**: The icon shown when users install the app as a PWA
- **Splash Screen**: The icon shown when the app is loading as a PWA

## Customizing the Icon

If you want to customize the icon:

1. Edit the `public/favicon.svg` file
2. Run the icon generation script again to update all PNG versions
3. The changes will be reflected in all icon sizes

## Technical Details

The icons are referenced in:

1. `src/app/layout.js` - Using Next.js metadata API
2. `public/manifest.json` - For PWA support

The app is configured to be installable as a Progressive Web App (PWA), which allows users to add it to their home screen or desktop for a more app-like experience. 