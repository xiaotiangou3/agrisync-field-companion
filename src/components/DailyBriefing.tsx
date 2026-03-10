import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchFieldData } from '@/lib/mock-field-api';
import { generateMockWeather } from '@/lib/pest-prediction';
import { getAlerts, type CommunityAlert } from '@/lib/alerts-store';
import { getScheduledActions } from '@/lib/scheduler-store';
import { isToday, parseISO } from 'date-fns';

export default function DailyBriefing() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    setSummary('');

    try {
      const [fieldData, weather] = await Promise.all([
        fetchFieldData(),
        Promise.resolve(generateMockWeather()),
      ]);

      const alerts = getAlerts();
      const todayAlerts = alerts.filter((a) => isToday(new Date(a.created_at)));
      const allAlerts = alerts.slice(0, 5);

      const actions = getScheduledActions();
      const todayActions = actions.filter((a) => {
        try {
          return isToday(parseISO(a.date));
        } catch {
          return false;
        }
      });

      const todayWeather = weather[0];

      const context = {
        weather: todayWeather,
        fieldHealth: fieldData,
        todayAlerts: todayAlerts.length > 0 ? todayAlerts : allAlerts.slice(0, 3),
        todaySchedule: todayActions,
      };

      const response = await supabase.functions.invoke('daily-briefing', {
        body: { context },
      });

      if (response.error) throw new Error(response.error.message);

      const text = typeof response.data === 'string' ? response.data : response.data?.summary ?? '';
      setSummary(text);
    } catch (e) {
      console.error('Daily briefing error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-[hsl(var(--nature-light))]">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-heading">
          <Sparkles className="h-5 w-5 text-primary" />
          Today's Briefing
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}
        {error && !loading && (
          <p className="text-sm text-muted-foreground">
            Unable to generate today's briefing. Tap refresh to try again.
          </p>
        )}
        {!loading && !error && summary && (
          <div className="prose prose-sm max-w-none text-sm text-foreground [&_p]:mb-1.5 [&_ul]:mt-1 [&_li]:text-sm [&_strong]:text-foreground">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
