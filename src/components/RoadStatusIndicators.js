import React from 'react';

/**
 * Component to display road status indicators with guaranteed alignment using fixed sizing
 */
export default function RoadStatusIndicators({ data }) {
  if (!data) return null;
  
  // Check if a highway has conditions
  const hasConditions = (highway) => {
    return data.roadConditions && data.roadConditions.some(cond => cond.highway === highway);
  };
  
  // Check if a highway has closures
  const hasClosures = (highway) => {
    return data.roadClosures && data.roadClosures.some(closure => closure.highway === highway);
  };
  
  return (
    <div className="w-full mb-4">
      <div className="flex items-start justify-center space-x-12">
        {/* First column - Highway 178 */}
        <div className="w-32 flex flex-col items-center">
          <div className="h-8 font-medium text-center mb-2">Hwy 178</div>
          <div className="h-12 flex items-center justify-center">
            <div className={`h-10 w-10 rounded-full ${hasClosures('178') ? 'bg-red-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="h-8 flex items-center justify-center mt-1">
            {hasConditions('178') && (
              <div className="bg-amber-500/10 px-2 py-1 rounded text-xs border border-amber-500/30 text-center w-full">
                Conditions Apply
              </div>
            )}
          </div>
        </div>
        
        {/* Second column - Highway 155 */}
        <div className="w-32 flex flex-col items-center">
          <div className="h-8 font-medium text-center mb-2">Hwy 155</div>
          <div className="h-12 flex items-center justify-center">
            <div className={`h-10 w-10 rounded-full ${hasClosures('155') ? 'bg-red-500' : 'bg-green-500'}`}></div>
          </div>
          <div className="h-8 flex items-center justify-center mt-1">
            {hasConditions('155') && (
              <div className="bg-amber-500/10 px-2 py-1 rounded text-xs border border-amber-500/30 text-center w-full">
                Conditions Apply
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 