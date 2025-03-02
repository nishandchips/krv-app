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

  // Custom tooltip formatter based on data type
  const formatTooltipValue = (value, name) => {
    if (isLakeStorage) {
      return [`${value.toLocaleString()} acre-ft`, 'Storage'];
    } else {
      return [`${value.toLocaleString()} cfs`, 'Flow'];
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
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
          domain={[yMin, yMax || 'auto']}
          tickFormatter={val => isLakeStorage ? `${(val/1000).toFixed(0)}k` : val}
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