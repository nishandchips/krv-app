import { useState } from 'react';

export function useViewMode() {
  const [viewMode, setViewMode] = useState('tiled');

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return { viewMode, toggleViewMode };
} 