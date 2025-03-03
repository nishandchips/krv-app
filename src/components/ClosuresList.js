import React from 'react';

/**
 * Component to display a list of road closures and conditions
 */
export default function ClosuresList({ closures, roadConditions = [] }) {
  // Check if there are any closures or conditions
  const hasInfo = closures.length > 0 || roadConditions.length > 0;

  return (
    <div className="flex-grow overflow-auto max-h-[calc(100%-80px)]">
      {hasInfo ? (
        <div className="space-y-3">
          {/* Display road closures if any */}
          {closures.length > 0 && (
            <div>
              <p className="text-red-500 font-semibold mb-2 text-center">Active Closures:</p>
              <ul className="space-y-2">
                {closures.map((closure, index) => (
                  <li key={`closure-${index}`} className="text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                    <p className="font-medium">{closure.highway ? `Hwy ${closure.highway}` : 'Road'}</p>
                    <p className="text-xs mt-1 break-words">{closure.description || 'Road closed'}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Display road conditions if any */}
          {roadConditions.length > 0 && (
            <div className={closures.length > 0 ? 'mt-4' : ''}>
              <p className="text-amber-400 font-semibold mb-2 text-center">Current Conditions:</p>
              <ul className="space-y-2">
                {roadConditions.map((condition, index) => (
                  <li key={`condition-${index}`} className="text-sm bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                    <p className="font-medium">Hwy {condition.highway}</p>
                    <p className="text-xs mt-1 break-words whitespace-normal">{condition.description}</p>
                    {condition.location && <p className="text-xs mt-1 text-gray-400 break-words">{condition.location}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-green-500 font-medium text-lg mb-2">All roads open</p>
            <p className="text-gray-400 text-xs italic">
              Road information will appear here when available
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 