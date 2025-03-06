"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DynamicLineChart = ({
  data,
  dataKey,
  stroke,
  yMax,
  yMin = 0,
  isLakeStorage,
  height = 300,
  width = 350,
  displayMode = 'volume',
  formatTooltip = null,
}) => {
  // Format the timestamp for x-axis
  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric'
    });
  };

  // Helper function to transform data for elevation display if needed
  const getDisplayData = () => {
    if (!isLakeStorage || displayMode === 'volume') {
      return data;
    }

    // If we're in elevation mode, transform the data
    return data.map(item => {
      // Create a shallow copy and transform only the value we need
      const transformedItem = { ...item };
      
      // Calculate elevation from volume
      if (transformedItem[dataKey] !== undefined && transformedItem[dataKey] !== null) {
        // Calculate elevation - this should match the formula in LakeStorageCard
        const emptyElevation = 2500;
        const fullElevation = 2605;
        const maxCapacity = 568000;
        
        const elevation = emptyElevation + ((transformedItem[dataKey] / maxCapacity) * (fullElevation - emptyElevation));
        transformedItem[dataKey] = Math.round(elevation);
      }
      
      return transformedItem;
    });
  };

  // Custom tooltip formatter based on data type and display mode
  const formatTooltipValue = (value, name) => {
    // Use custom formatter if provided
    if (formatTooltip) {
      return [formatTooltip(value), isLakeStorage ? (displayMode === 'volume' ? 'Storage' : 'Elevation') : 'Flow'];
    }

    // Default formatters
    if (isLakeStorage) {
      if (displayMode === 'volume') {
        return [`${value.toLocaleString()} acre-ft`, 'Storage'];
      } else {
        return [`${value.toLocaleString()} ft`, 'Elevation'];
      }
    } else {
      return [`${value.toLocaleString()} cfs`, 'Flow'];
    }
  };

  // Determine Y-axis formatter based on data type and display mode
  const formatYAxis = (val) => {
    if (isLakeStorage) {
      if (displayMode === 'volume') {
        return `${(val/1000).toFixed(0)}k`;
      } else {
        return val;
      }
    }
    return val;
  };

  // Determine domain based on data type and display mode
  const getDomain = () => {
    if (yMax) return [yMin, yMax];

    if (isLakeStorage && displayMode === 'elevation') {
      return [2500, 2605]; // approximate range for Lake Isabella elevation
    }
    
    return [yMin, 'auto'];
  };

  const displayData = getDisplayData();
  const [yAxisMin, yAxisMax] = getDomain();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={displayData}
        margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="timestamp"
          stroke="#888"
          tick={{ fill: '#888', fontSize: 10 }}
          interval="preserveStartEnd"
          tickFormatter={formatXAxis}
          angle={-45}
          textAnchor="end"
          height={50}
        />
        <YAxis 
          stroke="#888"
          tick={{ fill: '#888', fontSize: 10 }}
          domain={[yAxisMin, yAxisMax]}
          tickFormatter={formatYAxis}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
            padding: '8px'
          }}
          formatter={formatTooltipValue}
          labelFormatter={(label) => {
            const date = new Date(label);
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            });
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, stroke: stroke, strokeWidth: 1, fill: '#fff' }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DynamicLineChart;