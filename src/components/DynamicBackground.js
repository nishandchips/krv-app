"use client";

import { useState, useEffect } from 'react';

const DynamicBackground = () => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(false);
  
  // Fallback background if API fails
  const fallbackBackground = {
    urls: {
      regular: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max"
    },
    user: {
      name: "Unsplash",
      links: {
        html: "https://unsplash.com"
      }
    }
  };
  
  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Call our internal API route instead of external API directly
        const response = await fetch('/api/unsplash');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setImage(data);
        setError(false);
      } catch (error) {
        console.error('Error fetching background image:', error);
        setError(true);
        // Use fallback image
        setImage(fallbackBackground);
      }
    };

    fetchImage();
    // Refresh image every hour
    const interval = setInterval(fetchImage, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (!image) return null;

  return (
    <>
      {/* Blurred background for the entire page */}
      <div 
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: `url(${image.urls.regular})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          opacity: 0.85,
        }}
      />
      
      {/* Attribution - only show if not using fallback or if error occurred */}
      {!error && (
        <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 p-1 rounded z-50">
          Photo by <a href={`${image.user.links.html}?utm_source=dashboard&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="underline">{image.user.name}</a> on <a href="https://unsplash.com/?utm_source=dashboard&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
        </div>
      )}
    </>
  );
};

export default DynamicBackground; 