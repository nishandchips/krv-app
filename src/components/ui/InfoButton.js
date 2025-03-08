import { useState, useRef, useEffect } from 'react';

/**
 * InfoButton component that displays source information in a popup
 * 
 * @param {Object} props
 * @param {string} props.sourceName - The name of the data source
 * @param {string} props.sourceUrl - The URL of the data source
 * @param {string} props.className - Additional CSS classes for the button
 * @param {string} props.position - Position of the popup (default: 'bottom-right')
 */
export default function InfoButton({ sourceName, sourceUrl, className = '', position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle click outside to close the popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen && 
        popupRef.current && 
        !popupRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Determine popup position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'bottom-full right-full mb-2 mr-2';
      case 'top-right':
        return 'bottom-full left-0 mb-2';
      case 'bottom-left':
        return 'top-full right-full mt-2 mr-2';
      case 'bottom-right':
      default:
        return 'top-full left-0 mt-2';
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`text-blue-300 hover:text-blue-200 focus:outline-none transition-colors ${className}`}
        aria-label="Source information"
      >
        ⓘ
      </button>
      
      {isOpen && (
        <div 
          ref={popupRef}
          className={`absolute z-50 w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-md shadow-lg p-3 text-xs ${getPositionClasses()}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-white">Data Source</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          
          <div className="text-gray-300">
            <p className="mb-1"><span className="text-gray-400">Name:</span> {sourceName}</p>
            <p>
              <span className="text-gray-400">URL:</span>{' '}
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 hover:underline break-all"
              >
                {sourceUrl}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 