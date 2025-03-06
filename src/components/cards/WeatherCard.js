import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { locations } from '@/lib/locations';
import CardNavigation from '@/components/CardNavigation';

export default function WeatherCard({ data, weatherForecast, cardContentState, navigateCardContent, isMobile, onLocationChange }) {
  const currentView = cardContentState?.weather?.index || 0;
  const hasWeatherData = data && (data.temp !== undefined);
  const hasForecastData = weatherForecast && weatherForecast.length > 0;
  
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 shrink-0">
        <CardTitle className="text-lg">Weather</CardTitle>
        <div className="relative">
          <select 
            className="bg-gray-800 text-white border border-gray-700 rounded p-1 text-xs"
            onChange={(e) => {
              const selectedLoc = locations.find(loc => loc.id === e.target.value);
              if (selectedLoc && onLocationChange) {
                onLocationChange(selectedLoc);
              }
            }}
            value={data?.locationName ? locations.find(loc => loc.name === data.locationName)?.id : 'lake-isabella'}
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
      
      <CardContent className="p-3 flex-grow flex flex-col overflow-hidden relative">
        {!hasWeatherData && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-amber-400 mb-2">Connection Error</p>
            <p className="text-sm text-center">Unable to load weather data</p>
          </div>
        )}

        {hasWeatherData && (
          <>
            {currentView === 0 && (
              <div className="flex-grow flex flex-col overflow-hidden">
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center">
                    {data.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                        alt={data.description || "Weather"}
                        className="w-14 h-14"
                      />
                    )}
                    <p className="text-4xl font-bold">{data.temp ? `${Math.round(data.temp)}°F` : 'N/A'}</p>
                  </div>
                  <p className="text-base capitalize">{data.description || 'Weather unavailable'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">Humidity</p>
                    <p className="text-lg">{data.humidity ? `${data.humidity}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">Wind</p>
                    <p className="text-lg">{data.windSpeed ? `${Math.round(data.windSpeed)} mph` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">High</p>
                    <p className="text-lg">{data.tempMax ? `${Math.round(data.tempMax)}°F` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/30 p-2 rounded">
                    <p className="text-sm text-blue-400">Low</p>
                    <p className="text-lg">{data.tempMin ? `${Math.round(data.tempMin)}°F` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {currentView === 1 && hasForecastData && (
              <div className="flex-grow overflow-hidden">
                <p className="text-center text-blue-400 mb-2 text-sm">5-Day Forecast</p>
                <div className="space-y-2 overflow-y-auto max-h-[calc(100%-40px)]">
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
            
            {hasWeatherData && (
              <CardNavigation 
                onPrev={() => navigateCardContent('weather', 'prev')}
                onNext={() => navigateCardContent('weather', 'next')}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 