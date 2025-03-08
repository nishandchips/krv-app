"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DynamicLineChart from '@/components/DynamicLineChart';
import { fetchRoadClosuresLCS } from '@/lib/caltrans';
import { fetchLakeLevels } from '@/lib/cdec';
import { fetchRiverFlow } from '@/lib/usgs';
import { fetchWeather } from '@/lib/weather';
import { fetchWeatherForecast } from '@/lib/weatherForecast';
import DynamicBackground from '@/components/DynamicBackground';
import Logo from '@/components/Logo';
import TiledView from '@/components/TiledView';
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
    roadClosures: true,
    transit: true
  });
  const [selectedLocation, setSelectedLocation] = useState(getDefaultLocation());
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
          fetchRoadClosuresLCS(),
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
  }, [selectedLocation]);

  // Refetch weather data when location changes
  useEffect(() => {
    if (!loading) {
      const fetchWeatherForLocation = async () => {
        try {
          console.log('Fetching weather data for location:', selectedLocation?.name);
          const [weatherData, forecastData] = await Promise.all([
            fetchWeather(selectedLocation),
            fetchWeatherForecast(selectedLocation)
          ]);
          
          console.log('Weather data fetched:', 
            weatherData ? `temp: ${weatherData.temp}, icon: ${weatherData.icon}` : 'null',
            'Forecast data:', forecastData ? `count: ${forecastData.length}` : 'null');
          
          // Only update if we got valid data
          if (weatherData || forecastData) {
            setData(prev => {
              // Check if weatherData is already in the correct format or needs to be wrapped
              const formattedWeatherData = weatherData ? 
                (weatherData.temp !== undefined ? weatherData : { weather: weatherData }) : 
                prev.weather;
              
              const newData = {
                ...prev,
                weather: formattedWeatherData,
                weatherForecast: forecastData || prev.weatherForecast
              };
              
              console.log('Updated weather data:', 
                newData.weather ? 
                  (newData.weather.temp ? 
                    `direct temp: ${newData.weather.temp}` : 
                    `nested temp: ${newData.weather.weather?.temp}`) : 
                  'null');
              
              return newData;
            });
            
            setLastRefresh(new Date());
          }
        } catch (error) {
          console.error('Error fetching weather for location:', error);
        }
      };
      
      fetchWeatherForLocation();
    }
  }, [selectedLocation, loading]);

  // Function to handle location change from the WeatherCard
  const handleLocationChange = (location) => {
    console.log('Location changed to:', location);
    setSelectedLocation(location);
  };

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
      height: 'md:h-[calc(50vh-3rem)]'
    };
  };

  const cardSize = calculateCardSize();
  
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

  // Add a manual refresh function
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    setLoading(true);
    try {
      const [roadData, lakeData, riverData, weather, weatherForecast] = await Promise.all([
        fetchRoadClosuresLCS(),
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
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle road data refresh from the RoadClosuresCard
  const handleRoadDataRefresh = (freshRoadData) => {
    console.log('Road data refreshed:', freshRoadData);
    if (freshRoadData) {
      setData(prevData => ({
        ...prevData,
        roadClosures: freshRoadData.roadClosures || [],
        roadConditions: freshRoadData.roadConditions || []
      }));
      setLastRefresh(new Date());
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <DynamicBackground />
      
      {/* Banner with semi-transparent overlay */}
      <div className="flex-shrink-0 h-16 md:h-20 flex items-center justify-center bg-black/70 backdrop-blur-md relative z-10">
        <Logo />
      </div>

      {/* Main content */}
      <div className="flex-1 py-4 md:py-8 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto">
          <TiledView 
            data={{
              ...data,
              timestamp: lastRefresh
            }}
            activeCards={activeCards} 
            cardSize={cardSize}
            onRefreshRoadData={handleRoadDataRefresh}
            onLocationChange={handleLocationChange}
          />
        </div>
      </div>
      
      {/* Footer with last refresh time */}
      <div className="bg-black/70 backdrop-blur-md text-center py-2 text-xs text-gray-400">
        <p>Last updated: {lastRefresh.toLocaleString()}</p>
        <button 
          onClick={handleManualRefresh}
          className="mt-1 px-2 py-1 bg-blue-900/50 hover:bg-blue-900/70 rounded text-blue-300 text-xs transition-colors"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
        
        {/* Disclaimer */}
        <div className="mt-3 mx-auto max-w-2xl px-4">
          <details className="text-left">
            <summary className="cursor-pointer text-blue-300 hover:text-blue-200 transition-colors">
              Disclaimer
            </summary>
            <div className="mt-2 p-3 bg-black/50 rounded text-gray-300 text-xs leading-relaxed">
              <p>
                While we strive to ensure that the information provided on KRV.APP is accurate and regularly updated, 
                we cannot guarantee its completeness or accuracy at all times. The data presented here is intended for 
                informational purposes only. Users should independently verify the information through additional reliable 
                sources before making any decisions or taking actions based on the data provided.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}