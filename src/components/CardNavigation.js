"use client";

import React from 'react';

const CardNavigation = ({ onPrev, onNext }) => (
  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
    <button 
      onClick={onPrev} 
      className="h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center pointer-events-auto"
      aria-label="Previous content"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button 
      onClick={onNext} 
      className="h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center pointer-events-auto"
      aria-label="Next content"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

export default CardNavigation; 