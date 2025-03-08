import React from 'react';

/**
 * Component to display a list of road closures and conditions
 * Styled to match other card components
 */
export default function ClosuresList({ closures, roadConditions = [], timestamp, selectedHighway, dataSource = 'Caltrans' }) {
  // Filter out any invalid or empty conditions
  const validConditions = roadConditions.filter(condition => 
    condition && condition.description && condition.description.trim() !== ''
  );
  
  // Filter conditions based on the selected highway if one is selected
  const filteredConditions = selectedHighway 
    ? validConditions.filter(condition => condition.highway === selectedHighway)
    : validConditions;
  
  // Check if there are any closures or valid conditions
  const hasInfo = (closures && closures.length > 0) || filteredConditions.length > 0;
  
  // Format timestamp if available
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : null;

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
          <p className="text-gray-400 text-xs mt-1">
            Source: {dataSource}
          </p>
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

  // Function to determine if a condition is currently active based on time
  const isActiveNow = (description) => {
    if (!description) return true;
    
    // Check if the description contains time information
    const timeRegex = /from\s+(\d+:\d+\s*(?:AM|PM))\s+to\s+(\d+:\d+\s*(?:AM|PM))/i;
    const timeMatch = description.match(timeRegex);
    
    if (!timeMatch) return true; // If no time info, assume it's active
    
    // Extract start and end times
    const startTimeStr = timeMatch[1];
    const endTimeStr = timeMatch[2];
    
    // Convert to 24-hour format for comparison
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse the time strings
    const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (!startTimeParts || !endTimeParts) return true;
    
    let startHour = parseInt(startTimeParts[1], 10);
    const startMinute = parseInt(startTimeParts[2], 10);
    const startAmPm = startTimeParts[3].toUpperCase();
    
    let endHour = parseInt(endTimeParts[1], 10);
    const endMinute = parseInt(endTimeParts[2], 10);
    const endAmPm = endTimeParts[3].toUpperCase();
    
    // Convert to 24-hour format
    if (startAmPm === 'PM' && startHour < 12) startHour += 12;
    if (startAmPm === 'AM' && startHour === 12) startHour = 0;
    if (endAmPm === 'PM' && endHour < 12) endHour += 12;
    if (endAmPm === 'AM' && endHour === 12) endHour = 0;
    
    // Convert to minutes for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    // Check if current time is within the range
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  };

  return (
    <div className="w-full">
      {/* Display road closures if any */}
      {closures?.length > 0 && (
        <div className="mb-2">
          <p className="text-red-500 font-semibold mb-1 text-center text-sm">Current Closures:</p>
          <div className="space-y-1">
            {closures.map((closure, index) => (
              <div key={`closure-${index}`} className="bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                <p className="font-medium text-sm">Highway {closure.highway}</p>
                <p className="text-xs break-words" style={textWrapStyle}>
                  {closure.description || 'Road closed'}
                </p>
                {closure.county && (
                  <p className="text-xs text-gray-400 mt-1">
                    County: {closure.county}
                  </p>
                )}
                {!isActiveNow(closure.description) && (
                  <p className="text-xs text-amber-400 mt-1 font-medium">
                    Note: This closure is scheduled but not active at this moment
                  </p>
                )}
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
              ? `Current Hwy ${selectedHighway} Conditions:` 
              : 'Current Conditions:'}
          </p>
          <div className="space-y-1">
            {filteredConditions.map((condition, index) => (
              <div key={`condition-${index}`} className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                <p className="font-medium text-sm">Highway {condition.highway}</p>
                <p className="text-xs break-words" style={textWrapStyle}>
                  {condition.description}
                </p>
                {condition.county && (
                  <p className="text-xs text-gray-400 mt-1">
                    County: {condition.county}
                  </p>
                )}
                {condition.location && (
                  <p className="text-xs text-gray-400 break-words" style={textWrapStyle}>
                    {condition.location}
                  </p>
                )}
                {!isActiveNow(condition.description) && (
                  <p className="text-xs text-amber-400 mt-1 font-medium">
                    Note: This condition is scheduled but not active at this moment
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Display update timestamp and source if available */}
      {formattedTime && (
        <div className="mt-2 text-right">
          <p className="text-gray-400 text-xs italic">
            Last updated: {formattedTime}
          </p>
          <p className="text-gray-400 text-xs italic">
            Source: {dataSource}
          </p>
        </div>
      )}
    </div>
  );
} 