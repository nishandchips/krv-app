import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoadStatusIndicators from "@/components/RoadStatusIndicators";
import ClosuresList from "@/components/ClosuresList";
import { forceRefreshRoadConditions } from "@/lib/caltrans";
import { RefreshCw } from "lucide-react";

/**
 * Road closures card with consistent sizing to match LakeStorageCard exactly
 */
export default function RoadClosuresCard({ data, className, onRefresh }) {
  const [selectedHighway, setSelectedHighway] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  // Handle selecting which highway's conditions to display
  const handleSelectConditions = (highway) => {
    setSelectedHighway(highway);
  };
  
  // Handle manual refresh of road conditions
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const freshData = await forceRefreshRoadConditions();
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh(freshData);
      }
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing road data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Determine the data source
  const dataSource = data.source === 'lcs' ? 'Caltrans LCS' : 'Caltrans';
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Road Status</CardTitle>
        <div className="flex items-center">
          {lastRefreshTime && (
            <span className="text-xs text-gray-500 mr-2">
              Refreshed: {lastRefreshTime.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            title="Force refresh road conditions data from Caltrans"
          >
            <RefreshCw 
              className={`h-4 w-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            {isRefreshing && <span className="ml-1 text-xs">Refreshing...</span>}
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <RoadStatusIndicators 
          data={data} 
          onSelectConditions={handleSelectConditions}
          selectedHighway={selectedHighway}
        />
        <ClosuresList 
          closures={data?.roadClosures || []} 
          roadConditions={data?.roadConditions || []}
          timestamp={data?.timestamp}
          selectedHighway={selectedHighway}
          dataSource={dataSource}
        />
      </CardContent>
    </Card>
  );
} 