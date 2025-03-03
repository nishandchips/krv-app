"use client";

import { useState, useEffect } from 'react';

const DynamicBackground = () => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Custom background image - replace this URL with your own image
  const customBackgroundImage = "/images/kern-river-background.jpg";
  
  // Fallback background color if image fails to load
  const fallbackBackground = {
    backgroundColor: "#1a365d", // Deep blue color
    backgroundImage: "linear-gradient(135deg, #1a365d 0%, #2d3e50 100%)"
  };
  
  // Preload the image to check if it exists
  useEffect(() => {
    const img = new Image();
    img.src = customBackgroundImage;
    
    img.onload = () => {
      console.log("Custom background image loaded successfully.");
      setImageLoaded(true);
      setImageError(false);
    };
    
    img.onerror = () => {
      console.warn("Custom background image failed to load. Using fallback background.");
      setImageError(true);
      setImageLoaded(false);
    };
  }, [customBackgroundImage]);
  
  return (
    <>
      {/* Blurred background for the entire page */}
      <div 
        className="fixed inset-0 z-[-1]"
        style={
          imageError || !imageLoaded
            ? { 
                ...fallbackBackground,
                opacity: 0.9
              }
            : {
                backgroundImage: `url(${customBackgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px)',
                opacity: 0.85,
              }
        }
      />
      
      {/* Add a debug message during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 right-0 bg-black/70 text-white p-2 text-xs z-50">
          Background: {imageLoaded ? 'Custom Image' : 'Fallback Gradient'}
        </div>
      )}
    </>
  );
};

export default DynamicBackground; 