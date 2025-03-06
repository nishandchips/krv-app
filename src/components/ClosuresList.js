import React from 'react';

/**
 * Component to display a list of road closures and conditions
 * Styled to match other card components
 */
export default function ClosuresList({ closures, roadConditions = [], timestamp, selectedHighway }) {
  // Check if there are any closures or conditions
  const hasInfo = closures?.length > 0 || roadConditions?.length > 0;
  
  // Format timestamp if available
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : null;

  // Filter conditions based on the selected highway if one is selected
  const filteredConditions = selectedHighway 
    ? roadConditions.filter(condition => condition.highway === selectedHighway)
    : roadConditions;

  if (!hasInfo) {
    return (
      <div className="flex justify-center">
        <div className="text-center">
          <p className="text-green-500 font-medium text-sm">All roads open</p>
          <p className="text-gray-400 text-xs italic">
            Road information will appear here when available
          </p>
          {formattedTime && (
            <p className="text-gray-400 text-xs mt-1">
              Last updated: {formattedTime}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Styling for proper text wrapping
  const textWrapStyle = {
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };

  return (
    <div className="w-full">
      {/* Display road closures if any */}
      {closures?.length > 0 && (
        <div className="mb-2">
          <p className="text-red-500 font-semibold mb-1 text-center text-sm">Active Closures:</p>
          <div className="space-y-1">
            {closures.map((closure, index) => (
              <div key={`closure-${index}`} className="bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                <p className="font-medium text-sm">Highway {closure.highway}</p>
                <p className="text-xs break-words" style={textWrapStyle}>
                  {closure.description || 'Road closed'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display road conditions if any */}
      {filteredConditions.length > 0 && (
        <div>
          <p className="text-amber-400 font-semibold mb-1 text-center text-sm">
            {selectedHighway 
              ? `Hwy ${selectedHighway} Conditions:` 
              : 'Current Conditions:'}
          </p>
          <div className="space-y-1">
            {filteredConditions.map((condition, index) => (
              <div key={`condition-${index}`} className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                <p className="font-medium text-sm">Highway {condition.highway}</p>
                <p className="text-xs break-words" style={textWrapStyle}>
                  {condition.description}
                </p>
                {condition.location && (
                  <p className="text-xs text-gray-400 break-words" style={textWrapStyle}>
                    {condition.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Display update timestamp if available */}
      {formattedTime && (
        <div className="mt-2 text-right">
          <p className="text-gray-400 text-xs italic">Last updated: {formattedTime}</p>
        </div>
      )}
    </div>
  );
} 