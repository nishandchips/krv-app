import RoadClosuresCard from './cards/RoadClosuresCard';
import LakeStorageCard from './cards/LakeStorageCard';
import RiverFlowCard from './cards/RiverFlowCard';
import WeatherCard from './cards/WeatherCard';
import CardNavigation from './navigation/CardNavigation';

export default function SingleCardView({ data, activeCards, currentCardIndex, onNavigate, cardSize }) {
  const activeCardKeys = Object.entries(activeCards)
    .filter(([_, isActive]) => isActive)
    .map(([key]) => key);
  const currentCard = activeCardKeys[currentCardIndex];

  const renderCard = () => {
    switch(currentCard) {
      case 'roadClosures':
        return <RoadClosuresCard data={data} />;
      case 'lakeStorage':
        return <LakeStorageCard data={data} />;
      case 'riverFlow':
        return <RiverFlowCard data={data} />;
      case 'weather':
        return <WeatherCard data={data} />;
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