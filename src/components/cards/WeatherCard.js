import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { locations } from '@/lib/locations';
import InfoButton from '@/components/ui/InfoButton';

export default function WeatherCard({ data, weatherForecast, cardContentState, navigateCardContent, onLocationChange }) {
  // Extract weather data from the nested structure if needed
  const weatherData = data?.weather ? data.weather : data;
  
  const currentView = cardContentState?.weather?.index || 0;
  const hasWeatherData = weatherData && (weatherData.temp !== undefined);
  const hasForecastData = weatherForecast && weatherForecast.length > 0;
  
  // Debug logging
  console.log('WeatherCard: Original data structure:', data ? JSON.stringify(data).substring(0, 100) + '...' : 'null');
  console.log('WeatherCard: Using data:', weatherData ? 'present' : 'missing', 
    weatherData ? `temp: ${weatherData.temp}, icon: ${weatherData.icon}, description: ${weatherData.description}` : '');
  if (weatherData && weatherData.temp === undefined) {
    console.error('WeatherCard: Data is present but temp is undefined:', JSON.stringify(weatherData));
  }
  console.log('WeatherCard: hasWeatherData:', hasWeatherData);
  console.log('WeatherCard: hasForecastData:', hasForecastData, 
    weatherForecast ? `count: ${weatherForecast.length}` : '');
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 shrink-0">
        <div className="flex items-center">
          <CardTitle className="text-lg">Weather</CardTitle>
          <InfoButton 
            sourceName="OpenWeather API" 
            sourceUrl="https://openweathermap.org/api" 
            className="ml-2 text-sm"
            position="bottom-left"
          />
        </div>
        <div className="relative">
          <select
            className="bg-gray-800 text-white border border-gray-700 rounded p-1 text-xs"
            onChange={(e) => {
              const selectedLoc = locations.find(loc => loc.id === e.target.value);
              if (selectedLoc && onLocationChange) {
                onLocationChange(selectedLoc);
              }
            }}
            value={weatherData?.locationName ? locations.find(loc => loc.name === weatherData.locationName)?.id : 'lake-isabella'}
            aria-label="Select location"
            disabled={!hasWeatherData}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-grow flex flex-col relative overflow-y-auto">
        {!hasWeatherData && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-amber-400 mb-2">Connection Error</p>
            <p className="text-sm text-center">Unable to load weather data</p>
            <p className="text-xs text-gray-400 mt-2">
              {weatherData ? `Invalid data received (missing temperature)` : 'No data available'}
            </p>
            {data && (
              <div className="mt-4 text-xs text-left bg-gray-800/50 p-2 rounded max-w-full overflow-auto">
                <p className="font-mono">Data received:</p>
                <pre className="text-xs text-gray-400 mt-1 max-h-20 overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {hasWeatherData && (
          <>
            {currentView === 0 && (
              <div className="flex-grow flex flex-col">
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center">
                    {weatherData.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                        alt={weatherData.description || "Weather"}
                        className="w-14 h-14"
                      />
                    )}
                    <p className="text-4xl font-bold">{weatherData.temp ? `${Math.round(weatherData.temp)}°F` : 'N/A'}</p>
                  </div>
                  <p className="text-base capitalize">{weatherData.description || 'Weather unavailable'}</p>

                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">Humidity</p>
                    <p className="text-lg">{weatherData.humidity ? `${weatherData.humidity}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">Wind</p>
                    <p className="text-lg">{weatherData.windSpeed ? `${Math.round(weatherData.windSpeed)} mph` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">High</p>
                    <p className="text-lg">{weatherData.tempMax ? `${Math.round(weatherData.tempMax)}°F` : 'N/A'}</p>

                  </div>
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">Low</p>
                    <p className="text-lg">{weatherData.tempMin ? `${Math.round(weatherData.tempMin)}°F` : 'N/A'}</p>

                  </div>
                </div>
              </div>
            )}

            {currentView === 1 && hasForecastData && (
              <div className="flex-grow overflow-y-auto">
                <p className="text-center text-blue-400 mb-2 text-sm">5-Day Forecast</p>
                <div className="space-y-2">
                  {weatherForecast.slice(0, 5).map((day, idx) => (
                    <div key={idx} className="p-2 bg-gray-800/30 rounded flex items-center">
                      <div className="w-10 h-10 mr-2 flex-shrink-0">
                        {day.icon && (
                          <img
                            src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                            alt={day.description}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-sm">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                        <p className="text-xs capitalize truncate">{day.description}</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="font-medium text-sm">{day.tempMax ? `${Math.round(day.tempMax)}°` : '-'}</p>
                        <p className="text-xs text-gray-400">{day.tempMin ? `${Math.round(day.tempMin)}°` : '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 1 && !hasForecastData && (
              <div className="flex flex-col items-center justify-center flex-grow">
                <p className="text-amber-400 mb-2">Forecast Unavailable</p>
                <p className="text-sm text-center">Unable to load forecast data</p>
              </div>
            )}

            {/* Navigation arrows in the middle of the card */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
              <button
                onClick={() => navigateCardContent && navigateCardContent('weather', 'prev')}
                className="h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center pointer-events-auto"
                aria-label="Previous content"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateCardContent && navigateCardContent('weather', 'next')}
                className="h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center pointer-events-auto"
                aria-label="Next content"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 