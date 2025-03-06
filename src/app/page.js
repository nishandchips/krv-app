"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DynamicLineChart from '@/components/DynamicLineChart';
import { fetchRoadClosures } from '@/lib/caltrans';
import { fetchLakeLevels } from '@/lib/cdec';
import { fetchRiverFlow } from '@/lib/usgs';
import { fetchWeather } from '@/lib/weather';
import { fetchWeatherForecast } from '@/lib/weatherForecast';
import DynamicBackground from '@/components/DynamicBackground';
import Logo from '@/components/Logo';
import CardNavigation from '@/components/CardNavigation';
import RiverFlowCard from '@/components/RiverFlowCard';
import LakeStorageCard from '@/components/LakeStorageCard';
import RoadClosuresCard from '@/components/cards/RoadClosuresCard';
import WeatherCard from '@/components/cards/WeatherCard';
import { locations, getDefaultLocation } from '@/lib/locations';

export default function Home() {
  const [data, setData] = useState({
    roadClosures: [],
    roadConditions: [],
    lakeData: [],
    riverData: { northFork: [], southFork: [] },
    weather: {},
    weatherForecast: []
  });
  const [loading, setLoading] = useState(true);
  const [activeCards, setActiveCards] = useState({
    weather: true,
    lakeIsabella: true,
    riverFlow: true,
    roadClosures: true
  });
  const [selectedLocation, setSelectedLocation] = useState(getDefaultLocation());
  const [isMobile, setIsMobile] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [cardContentState, setCardContentState] = useState({
    weather: { index: 0, total: 2 },
    riverFlow: { index: 0, total: 3 }
  });

  const currentLakeStorage = data.lakeData.length > 0 
    ? data.lakeData[data.lakeData.length - 1].level 
    : 'N/A';
  
  const recentLakeData = data.lakeData.slice(-30); // Get last 30 readings

  const fallbackLakeData = [
    { timestamp: '2023-06-01 12:00', level: 361000 },
    { timestamp: '2023-06-02 12:00', level: 362000 },
    { timestamp: '2023-06-03 12:00', level: 363000 },
    { timestamp: '2023-06-04 12:00', level: 364000 },
    { timestamp: '2023-06-05 12:00', level: 365000 },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [roadData, lakeData, riverData, weather, weatherForecast] = await Promise.all([
          fetchRoadClosures(),
          fetchLakeLevels(),
          fetchRiverFlow(),
          fetchWeather(selectedLocation),
          fetchWeatherForecast(selectedLocation)
        ]);

        setData({
          roadClosures: roadData.roadClosures || [],
          roadConditions: roadData.roadConditions || [],
          lakeData: lakeData.length > 0 ? lakeData : fallbackLakeData,
          riverData,
          weather,
          weatherForecast
        });
        
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use fallback data if fetch fails
        setData(prev => ({
          ...prev,
          lakeData: fallbackLakeData
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    // Set up auto-refresh every 15 minutes (900000 ms)
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchData();
      setLastRefresh(new Date());
    }, 900000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refetch weather data when location changes
  useEffect(() => {
    if (!loading) {
      const fetchWeatherForLocation = async () => {
        try {
          const [weatherData, forecastData] = await Promise.all([
            fetchWeather(selectedLocation),
            fetchWeatherForecast(selectedLocation)
          ]);
          
          setData(prev => ({
            ...prev,
            weather: weatherData,
            weatherForecast: forecastData
          }));
          
          setLastRefresh(new Date());
        } catch (error) {
          console.error('Error fetching weather for location:', error);
        }
      };
      
      fetchWeatherForLocation();
    }
  }, [selectedLocation, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black/50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-white text-xl">Loading data...</p>
      </div>
    );
  }

  // Make cards auto-scale to fit the viewport
  const calculateCardSize = () => {
    return {
      width: 'w-full',
      height: isMobile ? 'auto min-h-[280px]' : 'md:h-[calc(50vh-3rem)]'
    };
  };

  const cardSize = calculateCardSize();
  
  const navigateCardContent = (cardName, direction) => {
    setCardContentState(prev => {
      const currentState = { ...prev[cardName] };
      if (direction === 'next') {
        currentState.index = (currentState.index + 1) % currentState.total;
      } else {
        currentState.index = (currentState.index - 1 + currentState.total) % currentState.total;
      }
      return { ...prev, [cardName]: currentState };
    });
  };

  // Add a manual refresh function
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    fetchData();
    setLastRefresh(new Date());
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] flex-col">
      <DynamicBackground />
      
      {/* Banner with semi-transparent overlay */}
      <div className="flex-shrink-0 h-16 md:h-20 flex items-center justify-center bg-black/70 backdrop-blur-md relative z-10">
        <Logo />
      </div>

      {/* Main content */}
      <div className="flex-1 py-4 md:py-8 px-4 md:px-8 lg:px-12 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Road Closures Card */}
          {activeCards.roadClosures && (
            <div className={`${cardSize.width} ${cardSize.height} mx-auto`}>
              <RoadClosuresCard data={{ roadClosures: data.roadClosures, roadConditions: data.roadConditions, timestamp: lastRefresh }} />
            </div>
          )}

          {/* Lake Storage Card */}
          {activeCards.lakeIsabella && (
            <div className={`${cardSize.width} ${cardSize.height} mx-auto`}>
              <LakeStorageCard data={recentLakeData} />
            </div>
          )}

          {/* River Flow Card */}
          {activeCards.riverFlow && (
            <div className={`${cardSize.width} ${cardSize.height} mx-auto relative`}>
              <RiverFlowCard 
                data={data.riverData}
                cardContentState={cardContentState}
                navigateCardContent={navigateCardContent}
                isMobile={isMobile}
              />
              <CardNavigation 
                onPrev={() => navigateCardContent('riverFlow', 'prev')}
                onNext={() => navigateCardContent('riverFlow', 'next')}
              />
            </div>
          )}

          {/* Weather Card */}
          {activeCards.weather && (
            <div className={`${cardSize.width} ${cardSize.height} mx-auto relative`}>
              <WeatherCard 
                data={data.weather}
                weatherForecast={data.weatherForecast}
                cardContentState={cardContentState}
                navigateCardContent={navigateCardContent}
                isMobile={isMobile}
                onLocationChange={setSelectedLocation}
              />
            </div>
          )}

          {/* Add a small refresh indicator */}
          <div className="fixed bottom-2 right-2 text-xs text-gray-400 bg-black/50 p-1 rounded">
            Last updated: {lastRefresh.toLocaleTimeString()}
            <button 
              onClick={handleManualRefresh} 
              className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded text-xs"
              aria-label="Refresh data"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}