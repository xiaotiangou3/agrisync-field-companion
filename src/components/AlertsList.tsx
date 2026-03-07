import type { CommunityAlert } from '@/lib/alerts-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug, CloudRain, Microscope } from 'lucide-react';

const ALERT_CONFIG: Record<string, { icon: typeof Bug; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  pest: { icon: Bug, variant: 'destructive' },
  disease: { icon: Microscope, variant: 'secondary' },
  weather: { icon: CloudRain, variant: 'outline' },
};

interface AlertsListProps {
  alerts: CommunityAlert[];
}

export default function AlertsList({ alerts }: AlertsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <AlertTriangle className="h-5 w-5 text-earth" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {alerts.slice(0, 10).map((alert) => {
          const config = ALERT_CONFIG[alert.alert_type] || ALERT_CONFIG.pest;
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="mt-0.5 rounded-full bg-muted p-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{alert.crop_type}</span>
                  <Badge variant={config.variant} className="text-[10px] px-1.5 py-0">
                    {alert.alert_type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
