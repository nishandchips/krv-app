import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DynamicLineChart from '@/components/DynamicLineChart';
import InfoButton from '@/components/ui/InfoButton';

export default function LakeStorageCard({ data }) {
  const [viewMode, setViewMode] = useState('storage'); // 'elevation' or 'storage'
  
  const currentData = data.lakeData.length > 0 
    ? data.lakeData[data.lakeData.length - 1]
    : null;
  
  const recentLakeData = data.lakeData.slice(-30);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'elevation' ? 'storage' : 'elevation');
  };

  // Handle potential data issues gracefully
  const hasValidData = currentData && 
    typeof currentData.elevation !== 'undefined' && 
    typeof currentData.storage !== 'undefined' &&
    !isNaN(currentData.elevation) && 
    !isNaN(currentData.storage);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle>Lake Isabella</CardTitle>
          <InfoButton 
            sourceName="California Data Exchange Center (CDEC)" 
            sourceUrl="https://cdec.water.ca.gov/reservoir.html" 
            className="ml-2 text-sm"
            position="bottom-left"
          />
        </div>
        <button 
          onClick={toggleViewMode}
          className="px-2 py-1 text-xs rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
        >
          Show {viewMode === 'elevation' ? 'Volume' : 'Elevation'}
        </button>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="text-center mb-6">
          <p className="text-blue-400 mb-2">
            {viewMode === 'elevation' ? 'Current Elevation' : 'Current Storage'}
          </p>
          <p className="text-4xl font-bold">
            {hasValidData
              ? (viewMode === 'elevation' 
                ? `${currentData.elevation.toFixed(2)} ft`
                : `${Math.round(currentData.storage).toLocaleString()} acre-ft`)
              : 'Data Unavailable'
            }
          </p>
        </div>
        <div className="h-[250px]">
          {recentLakeData.length > 0 ? (
            <DynamicLineChart
              data={recentLakeData}
              dataKey={viewMode === 'elevation' ? 'elevation' : 'storage'}
              stroke="#60A5FA"
              isLakeElevation={viewMode === 'elevation'}
              isLakeStorage={viewMode === 'storage'}
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 