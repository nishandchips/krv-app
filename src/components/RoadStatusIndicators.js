import React from 'react';

/**
 * Component to display road status indicators with guaranteed alignment
 */
export default function RoadStatusIndicators({ data, onSelectConditions, selectedHighway }) {
  if (!data) return null;
  
  // Check if a highway has conditions
  const hasConditions = (highway) => {
    return data.roadConditions && data.roadConditions.some(cond => cond.highway === highway);
  };
  
  // Check if a highway has closures
  const hasClosures = (highway) => {
    return data.roadClosures && data.roadClosures.some(closure => closure.highway === highway);
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
            <div className={`h-8 w-8 rounded-full ${hasClosures('178') ? 'bg-red-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="flex items-center justify-center">
            {hasConditions('178') && (
              <button 
                onClick={() => handleConditionsClick('178')}
                className={`bg-amber-500/10 px-2 py-1 rounded text-xs border 
                  ${selectedHighway === '178' ? 'border-amber-500 font-medium' : 'border-amber-500/30'} 
                  text-center w-full hover:bg-amber-500/20 cursor-pointer text-amber-400`}
              >
                Conditions Apply
              </button>
            )}
          </div>
        </div>
        
        {/* Second column - Highway 155 */}
        <div className="flex flex-col items-center">
          <div className="font-medium text-center mb-1">Hwy 155</div>
          <div className="flex items-center justify-center mb-1">
            <div className={`h-8 w-8 rounded-full ${hasClosures('155') ? 'bg-red-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="flex items-center justify-center">
            {hasConditions('155') && (
              <button 
                onClick={() => handleConditionsClick('155')}
                className={`bg-amber-500/10 px-2 py-1 rounded text-xs border 
                  ${selectedHighway === '155' ? 'border-amber-500 font-medium' : 'border-amber-500/30'} 
                  text-center w-full hover:bg-amber-500/20 cursor-pointer text-amber-400`}
              >
                Conditions Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 