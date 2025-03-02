import { useState } from 'react';

export function useActiveCards() {
  const [activeCards, setActiveCards] = useState({
    roadClosures: true,
    lakeStorage: true,
    riverFlow: true,
    weather: true
  });

  const toggleCard = (cardName) => {
    setActiveCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  return { activeCards, toggleCard };
} 