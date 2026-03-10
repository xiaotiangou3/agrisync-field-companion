import { useState, useMemo } from 'react';
import WeatherForecast, {
  type CurrentWeather,
  type HourlyItem,
  type DayForecast,
} from '@/components/WeatherForecast';

const CONDITIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm'];

function randomCondition() {
  return CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
}

function generateMockData() {
  const current: CurrentWeather = {
    temp: Math.round(28 + Math.random() * 6),
    condition: randomCondition(),
    humidity: Math.round(55 + Math.random() * 35),
    windSpeed: Math.round(5 + Math.random() * 35),
  };

  const hourly: HourlyItem[] = Array.from({ length: 24 }, (_, i) => {
    const hour = (new Date().getHours() + i) % 24;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      time: `${h12}${ampm}`,
      temp: Math.round(current.temp + (Math.random() * 4 - 2)),
      condition: randomCondition(),
      rainProb: Math.round(Math.random() * 100),
      windSpeed: Math.round(5 + Math.random() * 40),
    };
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = new Date().getDay();
  const sevenDay: DayForecast[] = Array.from({ length: 7 }, (_, i) => ({
    day: i === 0 ? 'Today' : days[(todayIdx + i) % 7],
    condition: randomCondition(),
    high: Math.round(30 + Math.random() * 5),
    low: Math.round(22 + Math.random() * 4),
    rainProb: Math.round(Math.random() * 100),
  }));

  return { current, hourly, sevenDay };
}

export default function WeatherPage() {
  const mock = useMemo(generateMockData, []);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <WeatherForecast
        locationName="Kampung Ladang Hijau, Kedah"
        currentWeather={mock.current}
        hourlyForecast={mock.hourly}
        sevenDayForecast={mock.sevenDay}
        crops={['Padi', 'Chili', 'Durian']}
        onWeatherWarning={setWarningMsg}
      />
    </div>
  );
}
