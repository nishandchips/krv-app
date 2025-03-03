import React from 'react';

/**
 * Component to display a list of road closures and conditions
 * With fixed-height containers and proper text wrapping
 */
export default function ClosuresList({ closures, roadConditions = [] }) {
  // Check if there are any closures or conditions
  const hasInfo = closures?.length > 0 || roadConditions?.length > 0;

  if (!hasInfo) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <p className="text-green-500 font-medium text-lg mb-2">All roads open</p>
          <p className="text-gray-400 text-xs italic">
            Road information will appear here when available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-visible">
      {/* Display road closures if any */}
      {closures?.length > 0 && (
        <div className="mb-4">
          <p className="text-red-500 font-semibold mb-2 text-center">Active Closures:</p>
          <div className="space-y-2">
            {closures.map((closure, index) => (
              <div key={`closure-${index}`} className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                <p className="font-medium">Highway {closure.highway}</p>
                <p className="text-xs mt-1 break-words">
                  {closure.description || 'Road closed'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display road conditions if any */}
      {roadConditions?.length > 0 && (
        <div>
          <p className="text-amber-400 font-semibold mb-2 text-center">Current Conditions:</p>
          <div className="space-y-2">
            {roadConditions.map((condition, index) => (
              <div key={`condition-${index}`} className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
                <p className="font-medium">Highway {condition.highway}</p>
                <p className="text-xs mt-1 break-words whitespace-normal">
                  {condition.description}
                </p>
                {condition.location && (
                  <p className="text-xs mt-1 text-gray-400 break-words whitespace-normal">
                    {condition.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 