export function calculateYAxisRange(data) {
  if (!data || data.length === 0) return { yMin: 0, yMax: 250000 };

  const levels = data.map(d => d.level);
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  const maxDiff = Math.max(...levels.map(l => Math.abs(l - avg)));
  
  const padding = maxDiff * 0.1;
  
  return {
    yMin: Math.max(0, avg - maxDiff - padding),
    yMax: avg + maxDiff + padding
  };
} 