import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Leaf, TrendingUp, Droplets, Sun, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchFieldData, type FieldData } from '@/lib/mock-field-api';

function buildMetrics(data: FieldData) {
  return [
    { label: 'NDVI Score', value: data.ndvi.toFixed(2), icon: Leaf, color: 'text-primary', description: data.ndvi >= 0.6 ? 'Healthy vegetation' : data.ndvi >= 0.4 ? 'Moderate vegetation' : 'Low vegetation', progress: Math.round(data.ndvi * 100) },
    { label: 'Predicted Yield', value: `${data.predictedYield} t/ha`, icon: TrendingUp, color: 'text-earth', description: 'Model estimate', progress: Math.round((data.predictedYield / 6) * 100) },
    { label: 'Soil Moisture', value: `${data.soilMoisture}%`, icon: Droplets, color: 'text-sky', description: 'Optimal range', progress: data.soilMoisture },
    { label: 'Solar Exposure', value: `${data.solarExposure} hrs`, icon: Sun, color: 'text-warning', description: 'Good condition', progress: Math.round((data.solarExposure / 8) * 100) },
  ];
}

export default function FieldHealthCard() {
  const [data, setData] = useState<FieldData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchFieldData().then((d) => { setData(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const metrics = data ? buildMetrics(data) : [];

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <Leaf className="h-5 w-5 text-primary" />
          Field Health
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
            </div>
            <p className="text-lg font-semibold font-heading">{m.value}</p>
            <Progress value={m.progress} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">{m.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Export current data for chat context */
export { fetchFieldData } from '@/lib/mock-field-api';
