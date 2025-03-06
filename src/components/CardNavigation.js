"use client";

import React from 'react';

/**
 * CardNavigation component that supports both:
 * - Legacy interface with onPrev/onNext callbacks
 * - Modern interface with steps array, currentStep index, and onChange callback
 */
const CardNavigation = ({ 
  // Legacy interface
  onPrev, 
  onNext,
  // Modern interface
  steps = [],
  currentStep = 0,
  onChange = null,
  compact = false
}) => {
  // Determine which interface we're using
  const isModernInterface = steps.length > 0 && onChange !== null;
  
  // For modern interface
  const handleStepChange = (index) => {
    if (onChange && index >= 0 && index < steps.length) {
      onChange(index);
    }
  };

  // For compact view (dots only)
  if (isModernInterface && compact) {
    return (
      <div className="flex justify-center items-center gap-2">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => handleStepChange(index)}
            className={`h-2 w-2 rounded-full ${index === currentStep ? 'bg-white' : 'bg-gray-600'}`}
            aria-label={`Go to ${step}`}
            aria-current={index === currentStep ? 'step' : undefined}
          />
        ))}
      </div>
    );
  }
  
  // For modern interface with text labels
  if (isModernInterface) {
    return (
      <div className="flex justify-center items-center gap-2">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => handleStepChange(index)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              index === currentStep 
                ? 'bg-white text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            aria-label={`Go to ${step}`}
            aria-current={index === currentStep ? 'step' : undefined}
          >
            {step}
          </button>
        ))}
      </div>
    );
  }
  
  // Legacy interface
  return (
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
};

export default CardNavigation; 