import React from 'react';

/**
 * Component to display road status indicators with guaranteed alignment
 */
export default function RoadStatusIndicators({ data, onSelectConditions, selectedHighway }) {
  if (!data) return null;
  
  // Check if a highway has conditions
  const hasConditions = (highway) => {
    // Make sure we have road conditions data and there's at least one condition for this highway
    return data.roadConditions && 
           data.roadConditions.some(cond => 
             cond.highway === highway && 
             cond.description && 
             cond.description.trim() !== ''
           );
  };
  
  // Check if a highway has closures
  const hasClosures = (highway) => {
    return data.roadClosures && data.roadClosures.some(closure => closure.highway === highway);
  };
  
  // Get the status text for a highway
  const getStatusText = (highway) => {
    if (hasClosures(highway)) {
      return "Closure";
    } else if (hasConditions(highway)) {
      // Check if any conditions are currently active
      const conditions = data.roadConditions.filter(cond => cond.highway === highway);
      const isAnyActive = conditions.some(cond => isActiveNow(cond.description));
      
      return isAnyActive ? "Active Conditions" : "Scheduled Conditions";
    } else {
      return "Open";
    }
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
  
  // Handle click on "Conditions Apply" text
  const handleConditionsClick = (highway) => {
    if (onSelectConditions) {
      onSelectConditions(highway === selectedHighway ? null : highway);
    }
  };
  
  return (
    <div className="w-full rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        {/* First column - Highway 178 */}
        <div className="flex flex-col items-center">
          <div className="font-medium text-center mb-1">Hwy 178</div>
          <div className="flex items-center justify-center mb-1">
            <div className={`h-8 w-8 rounded-full ${hasClosures('178') ? 'bg-red-500' : hasConditions('178') ? 'bg-amber-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="flex items-center justify-center">
            {hasConditions('178') && (
              <button 
                onClick={() => handleConditionsClick('178')}
                className={`bg-amber-500/10 px-2 py-1 rounded text-xs border 
                  ${selectedHighway === '178' ? 'border-amber-500 font-medium' : 'border-amber-500/30'} 
                  text-center w-full hover:bg-amber-500/20 cursor-pointer text-amber-400`}
              >
                {getStatusText('178')}
              </button>
            )}
          </div>
        </div>
        
        {/* Second column - Highway 155 */}
        <div className="flex flex-col items-center">
          <div className="font-medium text-center mb-1">Hwy 155</div>
          <div className="flex items-center justify-center mb-1">
            <div className={`h-8 w-8 rounded-full ${hasClosures('155') ? 'bg-red-500' : hasConditions('155') ? 'bg-amber-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="flex items-center justify-center">
            {hasConditions('155') && (
              <button 
                onClick={() => handleConditionsClick('155')}
                className={`bg-amber-500/10 px-2 py-1 rounded text-xs border 
                  ${selectedHighway === '155' ? 'border-amber-500 font-medium' : 'border-amber-500/30'} 
                  text-center w-full hover:bg-amber-500/20 cursor-pointer text-amber-400`}
              >
                {getStatusText('155')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 