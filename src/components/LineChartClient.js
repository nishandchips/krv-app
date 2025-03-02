"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Format X-axis labels
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

// Calculate wider, rounded Y-axis bounds
const getRoundedBounds = (data, dataKey, isLakeStorage = false) => {
  if (!data || data.length === 0) return { yMin: 0, yMax: 100 };

  const values = data.map(item => item[dataKey]).filter(v => typeof v === 'number' && !isNaN(v));
  if (values.length === 0) return { yMin: 0, yMax: 100 };

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1; // Avoid zero range

  // Pad by 20% of the range for more variance
  const padding = range * 0.2;
  let rawMin = minValue - padding;
  let rawMax = maxValue + padding;

  // Determine step size based on magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(rawMax || 1))));
  const step = magnitude / 2; // Larger steps for wider bounds

  // Round to nearest step
  let yMin = Math.floor(rawMin / step) * step;
  let yMax = Math.ceil(rawMax / step) * step;

  // Lake storage: cap yMax at 400,000
  if (isLakeStorage) {
    yMax = Math.min(yMax, 400000);
    yMin = Math.max(0, yMax - step * 4); // Wider range below cap
  }

  // Ensure yMin is non-negative and reasonable
  yMin = Math.max(0, yMin);
  if (yMax - yMin < step) yMax = yMin + step;

  return { yMin, yMax };
};

export default function LineChartClient({ data, dataKey, stroke, yMax, isLakeStorage }) {
  const { yMin, yMax: calculatedYMax } = getRoundedBounds(data, dataKey, isLakeStorage);
  const finalYMax = yMax !== undefined ? yMax : calculatedYMax;

  return (
    <LineChart
      width={340}
      height={200}
      data={data}
      margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" tickFormatter={formatDate} angle={-45} textAnchor="end" height={60} />
      <YAxis domain={[yMin, finalYMax]} />
      <Tooltip />
      <Line type="monotone" dataKey={dataKey} stroke={stroke} />
    </LineChart>
  );
}