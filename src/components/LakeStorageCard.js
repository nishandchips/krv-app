"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DynamicLineChart from '@/components/DynamicLineChart';

const LakeStorageCard = ({ data }) => {
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
  
  // Get the current storage (most recent data point)
  const getCurrentStorage = () => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1].level;
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
  
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg md:text-xl font-bold">Lake Isabella Storage</CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-3 flex-grow overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center mb-1">
              <p className="text-2xl md:text-4xl font-bold">
                {formatStorage(getCurrentStorage())}
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
                dataKey="level"
                stroke="#3B82F6"
                isLakeStorage={true}
                height="100%"
                width="100%"
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