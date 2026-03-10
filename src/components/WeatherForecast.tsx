import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning, Wind,
  Droplets, X, AlertTriangle, Thermometer, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface HourlyItem {
  time: string;
  temp: number;
  condition: string;
  rainProb: number;
  windSpeed: number;
}

export interface DayForecast {
  day: string;
  condition: string;
  high: number;
  low: number;
  rainProb: number;
}

interface WeatherForecastProps {
  locationName: string;
  currentWeather: CurrentWeather;
  hourlyForecast: HourlyItem[];
  sevenDayForecast: DayForecast[];
  crops: string[];
  onWeatherWarning?: (warning: string) => void;
}

function getWeatherIcon(condition: string, size = 24) {
  const c = condition.toLowerCase();
  const cls = `h-${size === 24 ? 6 : size === 48 ? 12 : 5} w-${size === 24 ? 6 : size === 48 ? 12 : 5}`;
  if (c.includes('thunder') || c.includes('storm')) return <CloudLightning className={cls} />;
  if (c.includes('heavy rain') || c.includes('downpour')) return <CloudRain className={cls} />;
  if (c.includes('rain') || c.includes('drizzle')) return <CloudDrizzle className={cls} />;
  if (c.includes('snow')) return <CloudSnow className={cls} />;
  if (c.includes('cloud') || c.includes('overcast')) return <Cloud className={cls} />;
  return <Sun className={cls} />;
}

function getFarmImpact(currentWeather: CurrentWeather, hourlyForecast: HourlyItem[], crops: string[]): string[] {
  const impacts: string[] = [];
  const highRainHours = hourlyForecast.filter((h) => h.rainProb > 60);
  const maxWind = Math.max(...hourlyForecast.map((h) => h.windSpeed));

  if (highRainHours.length > 0) {
    impacts.push(
      `Rain expected during ${highRainHours[0].time}${highRainHours.length > 1 ? ` and ${highRainHours.length - 1} more hours` : ''} — delay spraying or fertilizing ${crops[0] || 'your crops'} to avoid washoff.`
    );
  }
  if (currentWeather.humidity > 80) {
    impacts.push(
      `High humidity (${currentWeather.humidity}%) increases fungal risk for ${crops.length > 1 ? crops.slice(0, 2).join(' & ') : crops[0] || 'crops'}. Monitor leaves closely.`
    );
  }
  if (maxWind > 30) {
    impacts.push(`Strong winds up to ${maxWind}km/h today. Secure any lightweight structures and avoid drone operations.`);
  }
  if (impacts.length === 0) {
    impacts.push(`Good conditions today for fieldwork on your ${crops.slice(0, 2).join(' & ') || 'crops'}. Consider irrigating if soil moisture is low.`);
  }
  return impacts.slice(0, 3);
}

export default function WeatherForecast({
  locationName,
  currentWeather,
  hourlyForecast,
  sevenDayForecast,
  crops,
  onWeatherWarning,
}: WeatherForecastProps) {
  const [warningDismissed, setWarningDismissed] = useState(false);

  const warning = useMemo(() => {
    const rainHour = hourlyForecast.find((h) => h.rainProb > 70);
    const windHour = hourlyForecast.find((h) => h.windSpeed > 40);
    if (rainHour) return `Heavy rain (${rainHour.rainProb}% probability) expected at ${rainHour.time}`;
    if (windHour) return `High wind speed (${windHour.windSpeed}km/h) expected at ${windHour.time}`;
    return null;
  }, [hourlyForecast]);

  useEffect(() => {
    if (warning && onWeatherWarning) onWeatherWarning(warning);
  }, [warning, onWeatherWarning]);

  const farmImpact = useMemo(
    () => getFarmImpact(currentWeather, hourlyForecast, crops),
    [currentWeather, hourlyForecast, crops]
  );

  return (
    <div className="space-y-3">
      {/* Warning Banner */}
      <AnimatePresence>
        {warning && !warningDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-30 rounded-lg bg-[hsl(var(--warning))] px-4 py-3 flex items-start gap-3 shadow-md"
          >
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning-light))] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Action Required</p>
              <p className="text-sm text-foreground/80">{warning}. Tap to reschedule affected tasks.</p>
            </div>
            <button onClick={() => setWarningDismissed(true)} className="shrink-0 p-1">
              <X className="h-4 w-4 text-foreground/70" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Weather */}
      <Card className="bg-gradient-to-br from-[hsl(var(--sky))] to-[hsl(var(--sky)/0.7)] text-primary-foreground border-none shadow-lg">
        <CardContent className="pt-6 pb-5">
          <p className="text-sm font-medium opacity-80">{locationName}</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-5xl font-heading font-bold">{currentWeather.temp}°</span>
              <p className="text-base mt-1 opacity-90 capitalize">{currentWeather.condition}</p>
            </div>
            <div className="opacity-90">{getWeatherIcon(currentWeather.condition, 48)}</div>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Droplets className="h-4 w-4" /> {currentWeather.humidity}%
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Wind className="h-4 w-4" /> {currentWeather.windSpeed} km/h
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <ScrollArea className="w-full">
            <div className="flex gap-1 pb-2">
              {hourlyForecast.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center gap-1.5 min-w-[64px] py-2.5 px-2 rounded-xl',
                    h.rainProb > 70 ? 'bg-[hsl(var(--warning-light))]' : 'bg-muted/50'
                  )}
                >
                  <span className="text-xs font-medium text-muted-foreground">{h.time}</span>
                  {getWeatherIcon(h.condition, 20)}
                  <span className="text-sm font-semibold">{h.temp}°</span>
                  {h.rainProb > 0 && (
                    <span className="text-[10px] text-[hsl(var(--sky))]">{h.rainProb}%</span>
                  )}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 7-Day */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="divide-y divide-border">
            {sevenDayForecast.map((d, i) => (
              <div key={i} className="flex items-center py-3 gap-3">
                <span className="w-12 text-sm font-medium">{d.day}</span>
                <div className="w-6">{getWeatherIcon(d.condition, 20)}</div>
                <div className="flex-1 flex items-center gap-1 text-sm">
                  <span className="font-semibold">{d.high}°</span>
                  <span className="text-muted-foreground">/ {d.low}°</span>
                </div>
                <Badge
                  variant={d.rainProb > 60 ? 'destructive' : 'secondary'}
                  className="text-xs min-w-[48px] justify-center"
                >
                  <Droplets className="h-3 w-3 mr-0.5" /> {d.rainProb}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Farm Impact */}
      <Card className="border-primary/20 bg-[hsl(var(--nature-light))]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-primary" />
            Farm Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {farmImpact.map((text, i) => (
            <p key={i} className="text-sm text-foreground leading-relaxed">{text}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
