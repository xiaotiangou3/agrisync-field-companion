import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface BriefRow {
  headline: string;
  subLabel: string;
}

interface DailyAIBriefProps {
  name: string;
  weatherAlert: BriefRow | null;
  communityAlert: BriefRow | null;
  topTask: BriefRow | null;
  loading?: boolean;
  onRefresh?: () => void;
}

const ROW_CONFIG = [
  { key: 'weather' as const, Icon: CloudRain, color: 'text-[hsl(var(--sky))]' },
  { key: 'community' as const, Icon: AlertTriangle, color: 'text-[hsl(var(--warning))]' },
  { key: 'task' as const, Icon: CheckCircle, color: 'text-primary' },
];

export default function DailyAIBrief({
  name,
  weatherAlert,
  communityAlert,
  topTask,
  loading = false,
  onRefresh,
}: DailyAIBriefProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const rows = [weatherAlert, communityAlert, topTask];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl bg-[hsl(var(--nature-dark))] text-primary-foreground shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div>
          <h2 className="text-lg font-heading font-semibold">
            Good Morning, {name} ☀️
          </h2>
          <p className="text-sm opacity-70 mt-0.5">{today}</p>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Rows */}
      <div className="px-4 pb-4 space-y-1">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="h-6 w-6 rounded-full bg-primary-foreground/15" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-4/5 bg-primary-foreground/15" />
                  <Skeleton className="h-3 w-3/5 bg-primary-foreground/10" />
                </div>
              </div>
            ))
          : ROW_CONFIG.map(({ key, Icon, color }, i) => {
              const row = rows[i];
              if (!row) return null;
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 py-3 border-t border-primary-foreground/10 first:border-t-0"
                >
                  <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', color)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium leading-snug">{row.headline}</p>
                    <p className="text-sm opacity-60 mt-0.5 leading-snug">{row.subLabel}</p>
                  </div>
                </div>
              );
            })}
      </div>
    </motion.div>
  );
}
