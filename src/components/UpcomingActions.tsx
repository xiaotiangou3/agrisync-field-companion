import { format, parseISO, isToday, isTomorrow, isFuture } from 'date-fns';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getScheduledActions, type ScheduledAction } from '@/lib/scheduler-store';

interface UpcomingActionsProps {
  onGoToScheduler?: () => void;
}

export default function UpcomingActions({ onGoToScheduler }: UpcomingActionsProps) {
  const actions = getScheduledActions();
  const upcoming = actions
    .filter((a) => !a.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const formatLabel = (action: ScheduledAction) => {
    const d = parseISO(action.date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-heading">
            <CalendarClock className="h-5 w-5 text-primary" />
            Upcoming Actions
          </CardTitle>
          {onGoToScheduler && upcoming.length > 0 && (
            <button onClick={onGoToScheduler} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming actions scheduled. Head to the Scheduler to add reminders.
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((action) => {
              const d = parseISO(action.date);
              const overdue = !isFuture(d) && !isToday(d);
              return (
                <div key={action.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{action.title}</p>
                    {action.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{action.description}</p>
                    )}
                  </div>
                  <Badge variant={overdue ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 shrink-0">
                    {formatLabel(action)} · {action.time}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
