import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Leaf, TrendingUp, Droplets, Sun } from 'lucide-react';

const metrics = [
  { label: 'NDVI Score', value: 0.72, max: 1, icon: Leaf, color: 'text-primary', description: 'Healthy vegetation', progress: 72 },
  { label: 'Yield Forecast', value: '4.2 t/ha', icon: TrendingUp, color: 'text-earth', description: 'Above average', progress: 78 },
  { label: 'Soil Moisture', value: '64%', icon: Droplets, color: 'text-sky', description: 'Optimal range', progress: 64 },
  { label: 'Solar Exposure', value: '6.8 hrs', icon: Sun, color: 'text-warning', description: 'Good condition', progress: 85 },
];

export default function FieldHealthCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <Leaf className="h-5 w-5 text-primary" />
          Field Health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
            </div>
            <p className="text-lg font-semibold font-heading">{typeof m.value === 'number' ? m.value.toFixed(2) : m.value}</p>
            <Progress value={m.progress} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">{m.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
