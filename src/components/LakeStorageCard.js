"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DynamicLineChart from '@/components/DynamicLineChart';

const LakeStorageCard = ({ data }) => {
  // Add state for the display mode (volume or elevation)
  const [displayMode, setDisplayMode] = useState('volume'); // 'volume' or 'elevation'

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  // Format the storage value with commas for thousands
  const formatStorage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString() + ' acre-feet';
  };
  
  // Format the elevation value
  const formatElevation = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString() + ' ft';
  };
  
  // Get the current storage (most recent data point)
  const getCurrentStorage = () => {
    if (!data || data.length === 0) return null;
    // Use storage property if available, fall back to level for backward compatibility
    const latestData = data[data.length - 1];
    return latestData.storage !== undefined ? latestData.storage : latestData.level;
  };
  
  // Get the current elevation (most recent data point)
  const getCurrentElevation = () => {
    if (!data || data.length === 0) return null;
    // Use elevation property if available, otherwise calculate from storage
    const latestData = data[data.length - 1];
    if (latestData.elevation !== undefined) {
      return latestData.elevation;
    } else {
      // Fall back to calculating elevation from storage/level
      const storage = latestData.storage !== undefined ? latestData.storage : latestData.level;
      return calculateElevationFromVolume(storage);
    }
  };
  
  // Calculate elevation from volume (acre-feet) - used as fallback if elevation not provided
  const calculateElevationFromVolume = (volumeAcreFeet) => {
    // Simple approximation - Lake Isabella is approx 2,500 feet when empty and 2,605 feet when full (568,000 acre-feet)
    const emptyElevation = 2500;
    const fullElevation = 2605;
    const maxCapacity = 568000;
    
    // Linear interpolation between empty and full
    const elevation = emptyElevation + ((volumeAcreFeet / maxCapacity) * (fullElevation - emptyElevation));
    return Math.round(elevation);
  };
  
  // Get the timestamp of the most recent data point
  const getLatestTimestamp = () => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1].timestamp;
  };
  
  // Calculate the percentage of capacity
  const getCapacityPercentage = () => {
    const currentStorage = getCurrentStorage();
    if (currentStorage === null) return null;
    
    // Lake Isabella capacity is approximately 568,000 acre-feet
    const capacity = 568000;
    return Math.round((currentStorage / capacity) * 100);
  };
  
  // Get the display value based on the current mode
  const getDisplayValue = () => {
    if (displayMode === 'volume') {
      const currentStorage = getCurrentStorage();
      return currentStorage === null ? 'N/A' : formatStorage(currentStorage);
    } else {
      const currentElevation = getCurrentElevation();
      return currentElevation === null ? 'N/A' : formatElevation(currentElevation);
    }
  };
  
  // Get the data key to use for the chart based on display mode
  const getChartDataKey = () => {
    if (displayMode === 'volume') {
      // Check if data has storage property, otherwise use level
      return data[0].storage !== undefined ? 'storage' : 'level';
    } else {
      // Check if data has elevation property, otherwise use level and transform
      return data[0].elevation !== undefined ? 'elevation' : 'level';
    }
  };
  
  // Format chart tooltip value based on display mode
  const formatChartTooltip = (value) => {
    if (displayMode === 'volume') {
      return formatStorage(value);
    } else {
      // If we're showing elevation but using level data, transform the value
      if (getChartDataKey() === 'level') {
        return formatElevation(calculateElevationFromVolume(value));
      }
      return formatElevation(value);
    }
  };
  
  // Toggle between volume and elevation display
  const toggleDisplayMode = () => {
    setDisplayMode(displayMode === 'volume' ? 'elevation' : 'volume');
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl font-bold">Lake Isabella Storage</CardTitle>
          <button 
            onClick={toggleDisplayMode}
            className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors"
            aria-label={`Switch to ${displayMode === 'volume' ? 'elevation' : 'volume'} display`}
          >
            {displayMode === 'volume' ? 'Show Elevation' : 'Show Volume'}
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-3 flex-grow overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center mb-1">
              <p className="text-2xl md:text-4xl font-bold">
                {getDisplayValue()}
              </p>
            </div>
            <p className="text-sm text-gray-300 mb-1">
              {getCapacityPercentage() !== null ? `${getCapacityPercentage()}% of capacity` : 'Capacity unknown'}
            </p>
            <p className="text-xs text-gray-400">
              Updated: {formatTimestamp(getLatestTimestamp())}
            </p>
          </div>
          <div className="flex-grow flex items-center justify-center h-[150px] md:h-[180px]">
            {data && data.length > 0 ? (
              <DynamicLineChart
                data={data}
                dataKey={getChartDataKey()}
                stroke="#3B82F6"
                isLakeStorage={true}
                height="100%"
                width="100%"
                displayMode={displayMode}
                formatTooltip={formatChartTooltip}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LakeStorageCard; 