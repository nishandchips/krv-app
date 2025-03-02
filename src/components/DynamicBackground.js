"use client";

import { useState, useEffect } from 'react';

const DynamicBackground = ({ unsplashAccessKey }) => {
  const [image, setImage] = useState(null);
  
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=lake+isabella+kern+river&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${unsplashAccessKey}`
            }
          }
        );
        const data = await response.json();
        setImage(data);
      } catch (error) {
        console.error('Error fetching background image:', error);
      }
    };

    fetchImage();
    // Refresh image every hour
    const interval = setInterval(fetchImage, 3600000);
    return () => clearInterval(interval);
  }, [unsplashAccessKey]);

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
      
      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 p-1 rounded z-50">
        Photo by <a href={`${image.user.links.html}?utm_source=dashboard&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="underline">{image.user.name}</a> on <a href="https://unsplash.com/?utm_source=dashboard&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
      </div>
    </>
  );
};

export default DynamicBackground; 