import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Bug, Thermometer, Droplets, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { generateMockWeather, predictHatchingWindows, type HatchingPrediction, type WeatherDay } from '@/lib/pest-prediction';
import { fetchFieldData } from '@/lib/mock-field-api';

const RISK_STYLES: Record<string, { badge: 'default' | 'destructive' | 'secondary' | 'outline'; color: string }> = {
  critical: { badge: 'destructive', color: 'text-destructive' },
  high: { badge: 'destructive', color: 'text-destructive' },
  moderate: { badge: 'default', color: 'text-accent' },
  low: { badge: 'secondary', color: 'text-muted-foreground' },
};

function WeatherStrip({ weather }: { weather: WeatherDay[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
      {weather.slice(0, 7).map((d) => (
        <div key={d.date} className="flex flex-col items-center min-w-[48px] rounded-lg bg-muted/50 px-1.5 py-2 text-center">
          <span className="text-[10px] text-muted-foreground">{new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</span>
          <Thermometer className="h-3 w-3 text-destructive my-0.5" />
          <span className="text-[11px] font-semibold">{d.tempMax}°</span>
          <Droplets className="h-3 w-3 text-sky mt-0.5" />
          <span className="text-[10px] text-muted-foreground">{d.humidity}%</span>
        </div>
      ))}
    </div>
  );
}

export default function PestPredictionCard() {
  const [predictions, setPredictions] = useState<HatchingPrediction[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPest, setExpandedPest] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [fieldData, weatherData] = await Promise.all([
      fetchFieldData(),
      Promise.resolve(generateMockWeather()),
    ]);
    setWeather(weatherData);
    setPredictions(predictHatchingWindows(weatherData, fieldData.ndvi));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <Bug className="h-5 w-5 text-primary" />
          Pest Hatching Forecast
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <WeatherStrip weather={weather} />

        <div className="space-y-2">
          {predictions.map((p) => {
            const style = RISK_STYLES[p.riskLevel] || RISK_STYLES.low;
            const isOpen = expandedPest === p.pest.id;

            return (
              <div key={p.pest.id} className="rounded-lg border bg-card overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-3 text-left"
                  onClick={() => setExpandedPest(isOpen ? null : p.pest.id)}
                >
                  <span className="text-xl">{p.pest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{p.pest.name}</span>
                      <Badge variant={style.badge} className="text-[10px] px-1.5 py-0">
                        {p.riskLevel}
                      </Badge>
                    </div>
                    <Progress value={p.riskScore} className="h-1 mt-1.5" />
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ minWidth: 32 }}>
                    {p.riskScore}%
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t pt-2">
                    <p className="text-xs italic text-muted-foreground">{p.pest.scientificName}</p>

                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">
                        Hatching window: {new Date(p.estimatedWindow.start).toLocaleDateString('en', { month: 'short', day: 'numeric' })} – {new Date(p.estimatedWindow.end).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {p.pest.riskCrops.map((c) => (
                        <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>

                    {p.triggers.length > 0 && (
                      <ul className="space-y-1 mt-1">
                        {p.triggers.map((t, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
