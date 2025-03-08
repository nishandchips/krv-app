import RoadClosuresCard from './cards/RoadClosuresCard';
import LakeStorageCard from './cards/LakeStorageCard';
import RiverFlowCard from './cards/RiverFlowCard';
import WeatherCard from './cards/WeatherCard';
import TransitCard from './cards/TransitCard';
import CardNavigation from './navigation/CardNavigation';

export default function SingleCardView({ data, activeCards, currentCardIndex, onNavigate, cardSize, onRefreshRoadData }) {
  const activeCardKeys = Object.entries(activeCards)
    .filter(([_, isActive]) => isActive)
    .map(([key]) => key);
  const currentCard = activeCardKeys[currentCardIndex];

  // Create a default cardContentState for RiverFlowCard
  const defaultCardContentState = {
    riverFlow: { index: 0, total: 2 }
  };

  const renderCard = () => {
    switch(currentCard) {
      case 'roadClosures':
        return (
          <RoadClosuresCard 
            data={{ 
              roadClosures: data.roadClosures, 
              roadConditions: data.roadConditions,
              timestamp: data.timestamp || new Date()
            }} 
            onRefresh={onRefreshRoadData} 
          />
        );
      case 'lakeIsabella':
        return <LakeStorageCard data={{ lakeData: data.lakeData || [] }} />;
      case 'riverFlow':
        return (
          <RiverFlowCard 
            data={data.riverData || { northFork: [], southFork: [] }}
            cardContentState={defaultCardContentState}
            navigateCardContent={onNavigate}
            isMobile={true}
          />
        );
      case 'weather':
        return (
          <WeatherCard 
            data={{ 
              weather: data.weather || {}, 
              forecast: data.weatherForecast || [] 
            }}
          />
        );
      case 'transit':
        return <TransitCard />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-8 min-h-[600px] md:min-h-[800px] py-4">
      <CardNavigation 
        onPrev={() => onNavigate('prev')}
        onNext={() => onNavigate('next')}
      />
      <div className={cardSize}>
        {renderCard()}
      </div>
    </div>
  );
} 