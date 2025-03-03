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
    <div className="flex justify-center items-center gap-8 mb-4">
      {/* Highway 178 Status */}
      <div className="flex flex-col items-center">
        <div className="text-base md:text-lg text-center mb-2">Hwy 178</div>
        <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '178') ? 'bg-red-500' : 'bg-green-500'} mb-1`}></div>
        {hasConditions('178') && (
          <div className="mt-1 text-xs text-amber-400 font-medium text-center">
            Conditions Apply
          </div>
        )}
      </div>
      
      {/* Highway 155 Status */}
      <div className="flex flex-col items-center">
        <div className="text-base md:text-lg text-center mb-2">Hwy 155</div>
        <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '155') ? 'bg-red-500' : 'bg-green-500'} mb-1`}></div>
        {hasConditions('155') && (
          <div className="mt-1 text-xs text-amber-400 font-medium text-center">
            Conditions Apply
          </div>
        )}
      </div>
    </div>
  );
} 