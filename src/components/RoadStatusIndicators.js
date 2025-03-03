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
    <div className="flex justify-center items-start gap-8 mb-4">
      {/* Highway 178 Status */}
      <div className="flex flex-col items-center w-24">
        <div className="text-base md:text-lg text-center mb-2">Hwy 178</div>
        {/* Fixed height container for status light */}
        <div className="flex items-center justify-center h-10">
          <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '178') ? 'bg-red-500' : 'bg-green-500'}`}></div>
        </div>
        {/* Fixed height container for conditions text */}
        <div className="h-5 mt-1">
          {hasConditions('178') && (
            <div className="text-xs text-amber-400 font-medium text-center">
              Conditions Apply
            </div>
          )}
        </div>
      </div>
      
      {/* Highway 155 Status */}
      <div className="flex flex-col items-center w-24">
        <div className="text-base md:text-lg text-center mb-2">Hwy 155</div>
        {/* Fixed height container for status light */}
        <div className="flex items-center justify-center h-10">
          <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '155') ? 'bg-red-500' : 'bg-green-500'}`}></div>
        </div>
        {/* Fixed height container for conditions text */}
        <div className="h-5 mt-1">
          {hasConditions('155') && (
            <div className="text-xs text-amber-400 font-medium text-center">
              Conditions Apply
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 