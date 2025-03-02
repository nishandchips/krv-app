import { useState, useCallback } from 'react';

export function useCardNavigation(activeCards) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const navigateCards = useCallback((direction) => {
    const activeCardKeys = Object.entries(activeCards)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentCardIndex + 1) % activeCardKeys.length;
    } else {
      newIndex = (currentCardIndex - 1 + activeCardKeys.length) % activeCardKeys.length;
    }
    setCurrentCardIndex(newIndex);
  }, [activeCards, currentCardIndex]);

  return { currentCardIndex, navigateCards };
} 