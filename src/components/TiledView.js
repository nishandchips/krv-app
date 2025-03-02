import RoadClosuresCard from './cards/RoadClosuresCard';
import LakeStorageCard from './cards/LakeStorageCard';
import RiverFlowCard from './cards/RiverFlowCard';
import WeatherCard from './cards/WeatherCard';

export default function TiledView({ data, activeCards, cardSize }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[800px] mx-auto">
      {activeCards.roadClosures && (
        <div className={cardSize}>
          <RoadClosuresCard data={data} />
        </div>
      )}
      {activeCards.lakeStorage && (
        <div className={cardSize}>
          <LakeStorageCard data={data} />
        </div>
      )}
      {activeCards.riverFlow && (
        <div className={cardSize}>
          <RiverFlowCard data={data} />
        </div>
      )}
      {activeCards.weather && (
        <div className={cardSize}>
          <WeatherCard data={data} />
        </div>
      )}
    </div>
  );
} 