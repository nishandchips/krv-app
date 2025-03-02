export async function fetchWeather() {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=35.755&lon=-118.425&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=imperial`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
} 