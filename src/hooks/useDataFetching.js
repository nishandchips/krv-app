import { useState, useEffect } from 'react';
import { fetchRoadClosures } from '@/lib/api/caltrans';
import { fetchLakeLevels } from '@/lib/api/cdec';
import { fetchRiverFlow } from '@/lib/api/usgs';
import { fetchWeather } from '@/lib/api/weather';
import { fetchWeatherForecast } from '@/lib/api/weatherForecast';

export function useDataFetching() {
  const [data, setData] = useState({
    roadClosures: [],
    roadConditions: [],
    lakeData: [],
    riverData: { northFork: [], southFork: [] },
    weather: {},
    weatherForecast: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [roadData, lakeData, riverData, weather, weatherForecast] = await Promise.all([
          fetchRoadClosures(),
          fetchLakeLevels(),
          fetchRiverFlow(),
          fetchWeather(),
          fetchWeatherForecast()
        ]);

        setData({
          roadClosures: roadData.roadClosures || [],
          roadConditions: roadData.roadConditions || [],
          lakeData,
          riverData,
          weather,
          weatherForecast
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
} 