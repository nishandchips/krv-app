/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure images are properly handled
  images: {
    unoptimized: true, // For static export
  },
  
  // Ensure all assets in the public directory are included
  assetPrefix: undefined,
  
  // Disable the dev indicator as it's not needed
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
