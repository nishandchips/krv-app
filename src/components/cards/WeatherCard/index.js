import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function WeatherCard({ data }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Weather</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        {data.weather.main ? (
          <div className="text-center">
            <p className="text-6xl mb-4">{Math.round(data.weather.main.temp)}°F</p>
            <p className="text-2xl mb-8">{data.weather.weather[0].description}</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-blue-400">Feels Like</p>
                <p className="text-2xl">{data.weather.main.feels_like}°F</p>
              </div>
              <div>
                <p className="text-blue-400">Humidity</p>
                <p className="text-2xl">{data.weather.main.humidity}%</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center">Weather data unavailable</p>
        )}
      </CardContent>
    </Card>
  );
} 