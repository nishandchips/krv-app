import RoadClosuresCard from './cards/RoadClosuresCard';
import LakeStorageCard from './cards/LakeStorageCard';
import RiverFlowCard from './RiverFlowCard';
import WeatherCard from './cards/WeatherCard';
import TransitCard from './cards/TransitCard';

export default function TiledView({ data, activeCards, cardSize, onRefreshRoadData }) {
  // Create a default cardContentState for RiverFlowCard
  const defaultCardContentState = {
    riverFlow: { index: 0, total: 2 }
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
            cardContentState={defaultCardContentState}
            isMobile={false}
          />
        </div>
      )}
      {activeCards.weather && (
        <div className={cardSize}>
          <WeatherCard 
            data={{ 
              weather: data.weather || {}, 
              forecast: data.weatherForecast || [] 
            }}
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