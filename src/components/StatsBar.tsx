import type { CommunityAlert } from '@/lib/alerts-store';
import { Bug, Microscope, CloudRain, MapPin } from 'lucide-react';

interface StatsBarProps {
  alerts: CommunityAlert[];
}

export default function StatsBar({ alerts }: StatsBarProps) {
  const pests = alerts.filter((a) => a.alert_type === 'pest').length;
  const diseases = alerts.filter((a) => a.alert_type === 'disease').length;
  const weather = alerts.filter((a) => a.alert_type === 'weather').length;

  const stats = [
    { label: 'Total Alerts', value: alerts.length, icon: MapPin, color: 'bg-primary/10 text-primary' },
    { label: 'Pest', value: pests, icon: Bug, color: 'bg-destructive/10 text-destructive' },
    { label: 'Disease', value: diseases, icon: Microscope, color: 'bg-earth-light text-earth-dark' },
    { label: 'Weather', value: weather, icon: CloudRain, color: 'bg-sky-light text-sky' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center rounded-lg border bg-card p-3 text-center">
          <div className={`rounded-full p-2 ${s.color}`}>
            <s.icon className="h-4 w-4" />
          </div>
          <span className="mt-2 text-xl font-bold font-heading">{s.value}</span>
          <span className="text-[10px] text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
