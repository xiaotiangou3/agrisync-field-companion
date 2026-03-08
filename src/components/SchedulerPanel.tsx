import { useState } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { CalendarIcon, Clock, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getScheduledActions,
  addScheduledAction,
  toggleScheduledAction,
  deleteScheduledAction,
  type ScheduledAction,
} from '@/lib/scheduler-store';
import { toast } from '@/hooks/use-toast';

export default function SchedulerPanel() {
  const [actions, setActions] = useState<ScheduledAction[]>(getScheduledActions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('08:00');

  const refresh = () => setActions(getScheduledActions());

  const handleAdd = () => {
    if (!title.trim() || !date) {
      toast({ title: 'Missing fields', description: 'Title and date are required.', variant: 'destructive' });
      return;
    }
    addScheduledAction({
      title: title.trim(),
      description: description.trim(),
      date: date.toISOString(),
      time,
    });
    refresh();
    setTitle('');
    setDescription('');
    setDate(undefined);
    setTime('08:00');
    setDialogOpen(false);
    toast({ title: 'Reminder added' });
  };

  const handleToggle = (id: string) => {
    toggleScheduledAction(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteScheduledAction(id);
    refresh();
  };

  const upcoming = actions.filter((a) => !a.completed);
  const completed = actions.filter((a) => a.completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-heading flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Scheduler
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Schedule a Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Title (e.g. Apply fertilizer)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Notes (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1" />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Reminder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {upcoming.length === 0 && completed.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            No reminders yet. Tap "New Reminder" to get started.
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((action) => (
              <ReminderItem key={action.id} action={action} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </CardContent>
        </Card>
      )}

      {completed.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completed.map((action) => (
              <ReminderItem key={action.id} action={action} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReminderItem({
  action,
  onToggle,
  onDelete,
}: {
  action: ScheduledAction;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const actionDate = parseISO(action.date);
  const overdue = !action.completed && isPast(actionDate) && !isToday(actionDate);

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-3 transition-colors', action.completed && 'opacity-60')}>
      <button onClick={() => onToggle(action.id)} className="mt-0.5 shrink-0" aria-label={action.completed ? 'Mark incomplete' : 'Mark complete'}>
        {action.completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', action.completed && 'line-through')}>{action.title}</p>
        {action.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{action.description}</p>}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant={overdue ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
            {format(actionDate, 'MMM d')} · {action.time}
          </Badge>
          {overdue && <span className="text-[10px] text-destructive font-medium">Overdue</span>}
        </div>
      </div>
      <button onClick={() => onDelete(action.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
