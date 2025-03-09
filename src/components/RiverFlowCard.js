"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DynamicLineChart from '@/components/DynamicLineChart';
import { getFlowStatusColor, getFlowStatusText } from '@/lib/usgs';
import InfoButton from '@/components/ui/InfoButton';

const RiverFlowCard = ({ 
  data, 
  cardContentState, 
  navigateCardContent
}) => {
  const [timeRange, setTimeRange] = useState('24h'); // '24h', '7d'
  
  // Get the appropriate data based on the selected time range
  const getNorthForkData = () => {
    switch(timeRange) {
      case '24h': return data.northFork24h || [];
      case '7d': return data.northFork7d || [];
      default: return data.northForkHistory || [];
    }
  };
  
  const getSouthForkData = () => {
    switch(timeRange) {
      case '24h': return data.southFork24h || [];
      case '7d': return data.southFork7d || [];
      default: return data.southForkHistory || [];
    }
  };
  
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
  
  // Get status color for the flow indicator
  const getStatusColor = (fork) => {
    if (!fork || !fork.status) return '#6B7280'; // Gray for unknown
    return getFlowStatusColor(fork.status);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-lg md:text-xl font-bold flex justify-between items-center">
          <div className="flex items-center">
            <span>Kern River Flow</span>
            <InfoButton 
              sourceName="USGS Water Data" 
              sourceUrl="https://waterdata.usgs.gov/nwis/rt" 
              className="ml-2 text-sm"
              position="bottom-right"
            />
          </div>
          <div className="flex text-xs space-x-1">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-2 py-1 rounded ${timeRange === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2 py-1 rounded ${timeRange === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              7d
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-3 flex-grow overflow-y-auto">
        {cardContentState.riverFlow.index === 0 ? (
          <div className="flex flex-col h-full">
            <div className="text-center mb-2">
              <p className="text-blue-400 mb-1 text-sm md:text-base">North Fork of the Kern River @ Kernville</p>
              <div className="flex items-center justify-center mb-1">
                <div 
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full mr-2" 
                  style={{ backgroundColor: getStatusColor(data.northFork) }}
                ></div>
                <p className="text-2xl md:text-4xl font-bold">
                  {data.northFork && data.northFork.value !== undefined 
                    ? `${Math.round(data.northFork.value)} cfs` 
                    : 'N/A'}
                </p>
              </div>
              {data.northFork && data.northFork.status && (
                <p className="text-sm text-gray-300 mb-1">
                  {getFlowStatusText(data.northFork.status)}
                </p>
              )}
              {data.northFork && data.northFork.timestamp && (
                <p className="text-xs text-gray-400">
                  Updated: {formatTimestamp(data.northFork.timestamp)}
                </p>
              )}
            </div>
            <div className="flex-grow flex items-center justify-center h-[150px] md:h-[180px]">
              {getNorthForkData().length > 0 ? (
                <DynamicLineChart
                  data={getNorthForkData()}
                  dataKey="flow"
                  stroke={getStatusColor(data.northFork)}
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
        ) : (
          <div className="flex flex-col h-full">
            <div className="text-center mb-2">
              <p className="text-blue-400 mb-1 text-sm md:text-base">South Fork of the Kern River</p>
              <div className="flex items-center justify-center mb-1">
                <div 
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full mr-2" 
                  style={{ backgroundColor: getStatusColor(data.southFork) }}
                ></div>
                <p className="text-2xl md:text-4xl font-bold">
                  {data.southFork && data.southFork.value !== undefined 
                    ? `${Math.round(data.southFork.value)} cfs` 
                    : 'N/A'}
                </p>
              </div>
              {data.southFork && data.southFork.status && (
                <p className="text-sm text-gray-300 mb-1">
                  {getFlowStatusText(data.southFork.status)}
                </p>
              )}
              {data.southFork && data.southFork.timestamp && (
                <p className="text-xs text-gray-400">
                  Updated: {formatTimestamp(data.southFork.timestamp)}
                </p>
              )}
            </div>
            <div className="flex-grow flex items-center justify-center h-[150px] md:h-[180px]">
              {getSouthForkData().length > 0 ? (
                <DynamicLineChart
                  data={getSouthForkData()}
                  dataKey="flow"
                  stroke={getStatusColor(data.southFork)}
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
        )}
      </CardContent>
    </Card>
  );
};

export default RiverFlowCard; 