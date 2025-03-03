import React from 'react';

/**
 * Component to display road status indicators for highways
 * Shows both closure status and any additional conditions
 */
export default function RoadStatusIndicators({ data, viewMode }) {
  // Check if a highway has any conditions
  const hasConditions = (highway) => {
    return data.roadConditions && data.roadConditions.some(cond => cond.highway === highway);
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Highway Names Row */}
        <div className="text-center">
          <div className="text-base md:text-lg mb-2">Hwy 178</div>
        </div>
        <div className="text-center">
          <div className="text-base md:text-lg mb-2">Hwy 155</div>
        </div>
        
        {/* Status Lights Row */}
        <div className="flex justify-center">
          <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '178') ? 'bg-red-500' : 'bg-green-500'}`}></div>
        </div>
        <div className="flex justify-center">
          <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '155') ? 'bg-red-500' : 'bg-green-500'}`}></div>
        </div>
        
        {/* Conditions Text Row */}
        <div className="text-center h-5">
          {hasConditions('178') && (
            <div className="text-xs text-amber-400 font-medium">
              Conditions Apply
            </div>
          )}
        </div>
        <div className="text-center h-5">
          {hasConditions('155') && (
            <div className="text-xs text-amber-400 font-medium">
              Conditions Apply
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 