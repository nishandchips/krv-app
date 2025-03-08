import RoadClosuresCard from './cards/RoadClosuresCard';
import LakeStorageCard from './cards/LakeStorageCard';
import RiverFlowCard from './RiverFlowCard';
import WeatherCard from './cards/WeatherCard';
import TransitCard from './cards/TransitCard';
import { useState } from 'react';

export default function TiledView({ data, activeCards, cardSize, onRefreshRoadData, onLocationChange }) {
  // Create a default cardContentState for cards
  const [cardContentState, setCardContentState] = useState({
    riverFlow: { index: 0, total: 2 },
    weather: { index: 0, total: 2 }
  });

  // Function to handle card content navigation
  const navigateCardContent = (cardName, direction) => {
    setCardContentState(prev => {
      const currentState = { ...prev[cardName] };
      if (direction === 'prev') {
        currentState.index = (currentState.index - 1 + currentState.total) % currentState.total;
      } else if (direction === 'next') {
        currentState.index = (currentState.index + 1) % currentState.total;
      } else if (typeof direction === 'number') {
        currentState.index = direction;
      }
      return { ...prev, [cardName]: currentState };
    });
  };

  // Function to handle location change for weather
  const handleLocationChange = (location) => {
    // Pass the location change up to the parent component if needed
    // For now, we'll just log it
    console.log('Location changed to:', location);
    
    // In a real implementation, you would call a function passed from the parent
    // to update the weather data for the new location
  };

  // Ensure riverData has the correct structure with fallbacks
  const riverData = data.riverData || {
    northFork: { value: null, status: null, timestamp: null },
    southFork: { value: null, status: null, timestamp: null },
    northForkHistory: [],
    southForkHistory: [],
    northFork24h: [],
    southFork24h: [],
    northFork7d: [],
    southFork7d: []
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[800px] mx-auto">
      {activeCards.roadClosures && (
        <div className={cardSize}>
          <RoadClosuresCard 
            data={{ 
              roadClosures: data.roadClosures, 
              roadConditions: data.roadConditions,
              timestamp: data.timestamp || new Date()
            }} 
            onRefresh={onRefreshRoadData}
          />
        </div>
      )}
      {activeCards.lakeIsabella && (
        <div className={cardSize}>
          <LakeStorageCard data={{ lakeData: data.lakeData || [] }} />
        </div>
      )}
      {activeCards.riverFlow && (
        <div className={cardSize}>
          <RiverFlowCard 
            data={riverData}
            cardContentState={cardContentState}
            navigateCardContent={navigateCardContent}
          />
        </div>
      )}
      {activeCards.weather && (
        <div className={cardSize}>
          <WeatherCard 
            data={data.weather || {}}
            weatherForecast={data.weatherForecast || []}
            cardContentState={cardContentState}
            navigateCardContent={navigateCardContent}
            onLocationChange={onLocationChange}
          />
        </div>
      )}
      {activeCards.transit && (
        <div className={cardSize}>
          <TransitCard />
        </div>
      )}
    </div>
  );
} 