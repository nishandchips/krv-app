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

export default function Home() {
  const [data, setData] = useState({
    roadClosures: [],
    lakeData: [],
    riverData: { northFork: [], southFork: [] },
    weather: {},
    weatherForecast: []
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tiled');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeCards, setActiveCards] = useState({
    roadClosures: true,
    lakeStorage: true,
    riverFlow: true,
    weather: true
  });
  const [isMobile, setIsMobile] = useState(false);
  const [cardContentState, setCardContentState] = useState({
    riverFlow: { index: 0, total: 2 }, // North Fork and South Fork
    weather: { index: 0, total: 2 },   // Current and Forecast
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());

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
        const [roadClosures, lakeData, riverData, weather, weatherForecast] = await Promise.all([
          fetchRoadClosures(),
          fetchLakeLevels(),
          fetchRiverFlow(),
          fetchWeather(),
          fetchWeatherForecast()
        ]);

        setData({
          roadClosures,
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
    if (viewMode === 'tiled') {
      return {
        width: isMobile ? 'w-full' : 'w-full',
        height: isMobile ? 'h-[320px]' : 'md:h-[calc(50vh-3rem)]'
      };
    } else {
      return {
        width: isMobile ? 'w-full' : 'md:w-[calc(100%-2rem)]',
        height: isMobile ? 'h-[500px]' : 'md:h-[calc(80vh-5rem)]'
      };
    }
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

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const navigateCards = (direction) => {
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
  };

  // Add a manual refresh function
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    fetchData();
    setLastRefresh(new Date());
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <DynamicBackground />
      
      {/* Banner with semi-transparent overlay */}
      <div className="flex-shrink-0 h-16 md:h-20 flex items-center justify-center bg-black/70 backdrop-blur-md relative z-10">
        <Logo />
      </div>

      {/* View mode toggles with improved styling and proper centering */}
      <div className="flex justify-center items-center py-2 bg-black/30 relative z-10">
        <div className="flex justify-center items-center w-full">
          <div className="inline-flex justify-center items-center">
            <button
              onClick={() => toggleViewMode('tiled')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'tiled' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title="Tiled View"
              aria-label="Switch to tiled view"
            >
              <div className="grid grid-cols-2 gap-1 w-6 h-6">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            
            <button
              onClick={() => toggleViewMode('oneCard')}
              className={`p-2 rounded-lg transition-all ml-4 ${
                viewMode === 'oneCard' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title="Single Card View"
              aria-label="Switch to single card view"
            >
              <div className="w-6 h-6 bg-current rounded-sm"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 overflow-y-auto pt-4 relative z-10 ${viewMode === 'oneCard' ? 'pb-16' : 'pb-4'}`}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm -z-10"></div>

        {viewMode === 'tiled' ? (
          <div className={`container mx-auto grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6 px-4`}>
            {/* Road Closures Card */}
            {activeCards.roadClosures && (
              <div className={`${cardSize.width} ${cardSize.height} mx-auto`}>
                <Card className="h-full overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl font-bold">Road Closures</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 flex-grow">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-center items-center gap-8 mb-6">
                        <div className="flex flex-col items-center">
                          <div className="text-base md:text-lg text-center mb-2">Hwy 178</div>
                          <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '178') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-base md:text-lg text-center mb-2">Hwy 155</div>
                          <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '155') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        </div>
                      </div>
                      
                      {data.roadClosures.length > 0 ? (
                        <div className="flex-grow overflow-auto">
                          <p className="text-red-500 font-semibold mb-2 text-center">Active Closures:</p>
                          <ul className="space-y-2">
                            {data.roadClosures.map((closure, index) => (
                              <li key={index} className="text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                                <p className="font-medium">{closure.highway ? `Hwy ${closure.highway}` : 'Road'}</p>
                                <p className="text-xs mt-1">{closure.description || 'Road closed'}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="flex-grow flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-green-500 font-medium text-lg mb-2">All roads open</p>
                            <p className="text-gray-400 text-xs italic">
                              Road closure info will appear here when available
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lake Storage Card */}
            {activeCards.lakeStorage && (
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
                <Card className="h-full overflow-hidden">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-lg md:text-xl font-bold">Weather</CardTitle>
                  </CardHeader>
                  <CardContent className="p-1 md:p-3 flex-grow overflow-y-auto">
                    {cardContentState.weather.index === 0 ? (
                      <div className="flex flex-col h-full">
                        <div className="text-center mb-1">
                          <p className="text-blue-400 mb-0.5 text-sm md:text-base">Current Conditions</p>
                          <div className="flex items-center justify-center mb-0.5">
                            {data.weather.icon && (
                              <img 
                                src={`https://openweathermap.org/img/wn/${data.weather.icon}@2x.png`} 
                                alt={data.weather.description} 
                                className="w-12 h-12 md:w-16 md:h-16"
                              />
                            )}
                            <p className="text-2xl md:text-4xl font-bold">
                              {data.weather.temp ? `${Math.round(data.weather.temp)}°F` : 'N/A'}
                            </p>
                          </div>
                          <p className="text-sm md:text-lg capitalize mb-0.5">{data.weather.description || ''}</p>
                          {data.weather.shortForecast && (
                            <p className="text-gray-300 mb-1 text-xs">{data.weather.shortForecast}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-1 md:gap-2">
                          <div className="text-center p-1 md:p-2 bg-blue-500/10 rounded-lg">
                            <p className="text-xs text-blue-400 mb-0.5">Humidity</p>
                            <p className="text-sm md:text-lg">{data.weather.humidity ? `${data.weather.humidity}%` : 'N/A'}</p>
                          </div>
                          <div className="text-center p-1 md:p-2 bg-blue-500/10 rounded-lg">
                            <p className="text-xs text-blue-400 mb-0.5">Wind</p>
                            <p className="text-sm md:text-lg">{data.weather.windSpeed ? `${Math.round(data.weather.windSpeed)} mph` : 'N/A'}</p>
                          </div>
                          <div className="text-center p-1 md:p-2 bg-blue-500/10 rounded-lg">
                            <p className="text-xs text-blue-400 mb-0.5">High</p>
                            <p className="text-sm md:text-lg">{data.weather.tempMax ? `${Math.round(data.weather.tempMax)}°F` : 'N/A'}</p>
                          </div>
                          <div className="text-center p-1 md:p-2 bg-blue-500/10 rounded-lg">
                            <p className="text-xs text-blue-400 mb-0.5">Low</p>
                            <p className="text-sm md:text-lg">{data.weather.tempMin ? `${Math.round(data.weather.tempMin)}°F` : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <p className="text-center text-blue-400 mb-1 text-xs md:text-sm">5-Day Forecast</p>
                        {data.weatherForecast && data.weatherForecast.length > 0 ? (
                          <div className="space-y-1 md:space-y-2 overflow-y-auto h-[calc(100%-1.5rem)]">
                            {data.weatherForecast.slice(0, 5).map((day, idx) => (
                              <div key={idx} className="p-1 md:p-1.5 bg-blue-500/10 rounded-lg flex items-center">
                                <div className="w-6 h-6 md:w-8 md:h-8 mr-1 md:mr-1.5">
                                  {day.icon && (
                                    <img 
                                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                                      alt={day.description} 
                                      className="w-full h-full"
                                    />
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <p className="font-medium text-xs">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                                  <p className="text-xs capitalize truncate">{day.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-xs">{day.tempMax ? `${Math.round(day.tempMax)}°` : '-'}</p>
                                  <p className="text-xs text-gray-400">{day.tempMin ? `${Math.round(day.tempMin)}°` : '-'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <p className="text-xs md:text-sm">No forecast available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <CardNavigation 
                  onPrev={() => navigateCardContent('weather', 'prev')}
                  onNext={() => navigateCardContent('weather', 'next')}
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
        ) : (
          <div className="container mx-auto py-2 px-4 flex flex-col items-center">
            <div className="flex justify-center gap-4 mb-4">
              <button 
                onClick={() => navigateCards('prev')}
                className="p-2 rounded-full bg-blue-500 text-white"
                aria-label="Previous card"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => navigateCards('next')}
                className="p-2 rounded-full bg-blue-500 text-white"
                aria-label="Next card"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {(() => {
              const activeCardKeys = Object.entries(activeCards)
                .filter(([_, isActive]) => isActive)
                .map(([key]) => key);
              
              if (activeCardKeys.length === 0) {
                return (
                  <Card className={`${cardSize.width} ${cardSize.height}`}>
                    <CardContent className="flex items-center justify-center h-full">
                      <p className="text-gray-400">No cards are active</p>
                    </CardContent>
                  </Card>
                );
              }
              
              const currentCard = activeCardKeys[currentCardIndex];
              
              switch (currentCard) {
                case 'roadClosures':
                  return (
                    <div className={`${cardSize.width} ${cardSize.height}`}>
                      <Card className="h-full overflow-hidden">
                        <CardHeader>
                          <CardTitle>Road Closures</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex-grow">
                          <div className="flex justify-center items-center gap-8 mb-6">
                            <div className="flex flex-col items-center">
                              <div className="text-base md:text-lg text-center mb-2">Hwy 178</div>
                              <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '178') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="text-base md:text-lg text-center mb-2">Hwy 155</div>
                              <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${data.roadClosures.some(c => c.highway === '155') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            </div>
                          </div>
                          
                          {data.roadClosures.length > 0 ? (
                            <div>
                              <p className="text-red-500 font-semibold mb-3">Active Closures:</p>
                              <ul className="space-y-3">
                                {data.roadClosures.map((closure, index) => (
                                  <li key={index} className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                                    <p className="font-medium">{closure.highway ? `Highway ${closure.highway}` : 'Road'}</p>
                                    <p className="text-sm mt-1">{closure.description || 'Road closed'}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="text-center flex-grow flex flex-col items-center justify-center h-full">
                              <p className="text-green-500 font-medium text-xl mb-2">All roads open</p>
                              <p className="text-gray-400">
                                Road closure information will appear here when available
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                  
                case 'lakeStorage':
                  return (
                    <div className={`${cardSize.width} ${cardSize.height}`}>
                      <LakeStorageCard data={recentLakeData} />
                    </div>
                  );
                  
                case 'riverFlow':
                  return (
                    <div className={`${cardSize.width} ${cardSize.height}`}>
                      <RiverFlowCard 
                        data={data.riverData}
                        cardContentState={cardContentState}
                        navigateCardContent={navigateCardContent}
                        isMobile={isMobile}
                      />
                      <div className="flex justify-center mt-4">
                        <CardNavigation 
                          onPrev={() => navigateCardContent('riverFlow', 'prev')}
                          onNext={() => navigateCardContent('riverFlow', 'next')}
                        />
                      </div>
                    </div>
                  );
                  
                case 'weather':
                  return (
                    <div className={`${cardSize.width} ${cardSize.height}`}>
                      <Card className="h-full overflow-hidden">
                        <CardHeader>
                          <CardTitle>Weather</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 flex-grow overflow-y-auto">
                          {cardContentState.weather.index === 0 ? (
                            <>
                              <div className="text-center mb-3">
                                <p className="text-blue-400 mb-1 text-sm md:text-base">Current Conditions</p>
                                <div className="flex items-center justify-center mb-1">
                                  {data.weather.icon && (
                                    <img 
                                      src={`https://openweathermap.org/img/wn/${data.weather.icon}@2x.png`} 
                                      alt={data.weather.description} 
                                      className="w-14 h-14 md:w-16 md:h-16"
                                    />
                                  )}
                                  <p className="text-3xl md:text-4xl font-bold">
                                    {data.weather.temp ? `${Math.round(data.weather.temp)}°F` : 'N/A'}
                                  </p>
                                </div>
                                <p className="text-lg md:text-xl capitalize mb-1">{data.weather.description || ''}</p>
                                {data.weather.shortForecast && (
                                  <p className="text-gray-300 mb-3 text-xs md:text-sm">{data.weather.shortForecast}</p>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div className="text-center p-2 md:p-3 bg-blue-500/10 rounded-lg">
                                  <p className="text-xs md:text-sm text-blue-400 mb-1">Humidity</p>
                                  <p className="text-base md:text-xl">{data.weather.humidity ? `${data.weather.humidity}%` : 'N/A'}</p>
                                </div>
                                <div className="text-center p-2 md:p-3 bg-blue-500/10 rounded-lg">
                                  <p className="text-xs md:text-sm text-blue-400 mb-1">Wind</p>
                                  <p className="text-base md:text-xl">{data.weather.windSpeed ? `${Math.round(data.weather.windSpeed)} mph` : 'N/A'}</p>
                                </div>
                                <div className="text-center p-2 md:p-3 bg-blue-500/10 rounded-lg">
                                  <p className="text-xs md:text-sm text-blue-400 mb-1">High</p>
                                  <p className="text-base md:text-xl">{data.weather.tempMax ? `${Math.round(data.weather.tempMax)}°F` : 'N/A'}</p>
                                </div>
                                <div className="text-center p-2 md:p-3 bg-blue-500/10 rounded-lg">
                                  <p className="text-xs md:text-sm text-blue-400 mb-1">Low</p>
                                  <p className="text-base md:text-xl">{data.weather.tempMin ? `${Math.round(data.weather.tempMin)}°F` : 'N/A'}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-center text-blue-400 mb-2 text-sm">5-Day Forecast</p>
                              {data.weatherForecast && data.weatherForecast.length > 0 ? (
                                <div className="space-y-2 md:space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
                                  {data.weatherForecast.slice(0, 5).map((day, idx) => (
                                    <div key={idx} className="p-2 bg-blue-500/10 rounded-lg flex items-center">
                                      <div className="w-8 h-8 md:w-10 md:h-10 mr-2">
                                        {day.icon && (
                                          <img 
                                            src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                                            alt={day.description} 
                                            className="w-full h-full"
                                          />
                                        )}
                                      </div>
                                      <div className="flex-grow">
                                        <p className="font-medium text-sm md:text-base">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                                        <p className="text-xs md:text-sm capitalize truncate">{day.description}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-sm md:text-base">{day.tempMax ? `${Math.round(day.tempMax)}°` : '-'}</p>
                                        <p className="text-xs md:text-sm text-gray-400">{day.tempMin ? `${Math.round(day.tempMin)}°` : '-'}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                  <p className="text-sm md:text-base">No forecast available</p>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                      <div className="flex justify-center mt-4">
                        <CardNavigation 
                          onPrev={() => navigateCardContent('weather', 'prev')}
                          onNext={() => navigateCardContent('weather', 'next')}
                        />
                      </div>
                    </div>
                  );
                  
                default:
                  return null;
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}