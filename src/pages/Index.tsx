import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import AlertMap from '@/components/AlertMap';
import FieldHealthCard from '@/components/FieldHealthCard';
import AlertsList from '@/components/AlertsList';
import AddAlertDialog from '@/components/AddAlertDialog';
import SchedulerPanel from '@/components/SchedulerPanel';
import UpcomingActions from '@/components/UpcomingActions';
import ReportIssueDrawer from '@/components/ReportIssueDrawer';
import StatsBar from '@/components/StatsBar';
import AgroChatPanel from '@/components/AgroChatPanel';
import PestPredictionCard from '@/components/PestPredictionCard';
import DailyAIBrief, { type BriefRow } from '@/components/DailyAIBrief';
import BugIdentifier from '@/components/BugIdentifier';
import WeatherPage from '@/pages/WeatherPage';
import BottomNav, { type Tab } from '@/components/BottomNav';
import { getAlerts, addAlert, type AlertType } from '@/lib/alerts-store';
import { getScheduledActions } from '@/lib/scheduler-store';
import { isToday, parseISO } from 'date-fns';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const tabFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function buildBriefRows(alerts: ReturnType<typeof getAlerts>) {
  // Weather row
  const weatherAlert: BriefRow = {
    headline: 'Heavy rain at 3PM — postpone fertilizing',
    subLabel: "Weather impact on today's tasks",
  };

  // Community alert row
  const recentAlert = alerts[0];
  const communityAlert: BriefRow = recentAlert
    ? {
        headline: `⚠️ ${recentAlert.alert_type === 'pest' ? 'Pest' : recentAlert.alert_type === 'disease' ? 'Disease' : 'Weather'} alert: ${recentAlert.description.slice(0, 50)}`,
        subLabel: `${recentAlert.crop_type} — reported nearby`,
      }
    : {
        headline: '⚠️ Padi Blast detected 5km away',
        subLabel: 'Nearest community disease alert',
      };

  // Task row
  const actions = getScheduledActions();
  const todayAction = actions.find((a) => {
    try { return isToday(parseISO(a.date)); } catch { return false; }
  });
  const topTask: BriefRow = todayAction
    ? { headline: `${todayAction.label} — due today`, subLabel: todayAction.crop || 'Scheduled task' }
    : { headline: 'Water chili seedlings — due by 9AM', subLabel: 'Highest priority task today' };

  return { weatherAlert, communityAlert, topTask };
}

export default function Index() {
  const [alerts, setAlerts] = useState(getAlerts);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [briefLoading, setBriefLoading] = useState(false);

  const profileRaw = localStorage.getItem('agrisync_farm_profile');
  const farmName = profileRaw ? JSON.parse(profileRaw)?.farmName : '';
  const userName = farmName || 'Farmer';

  const briefRows = useMemo(() => buildBriefRows(alerts), [alerts]);

  const handleRefreshBrief = useCallback(() => {
    setBriefLoading(true);
    setTimeout(() => setBriefLoading(false), 1200);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setClickedCoords({ lat, lng });
  }, []);

  const handleAddAlert = useCallback(
    (data: { latitude: number; longitude: number; crop_type: string; alert_type: AlertType; description: string }) => {
      addAlert(data);
      setAlerts(getAlerts());
      setClickedCoords(null);
    },
    []
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 container py-3 md:py-6 space-y-3 md:space-y-6 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" {...tabFade} className="space-y-3 md:space-y-6">
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <DailyAIBrief
                  name={userName}
                  weatherAlert={briefRows.weatherAlert}
                  communityAlert={briefRows.communityAlert}
                  topTask={briefRows.topTask}
                  loading={briefLoading}
                  onRefresh={handleRefreshBrief}
                />
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
                <StatsBar alerts={alerts} />
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
                <div className="rounded-lg border overflow-hidden bg-card shadow-sm">
                  <div className="p-3 border-b">
                    <h2 className="text-sm font-semibold font-heading">Community Alert Map</h2>
                    <p className="text-xs text-muted-foreground">Tap the map to report an alert</p>
                  </div>
                  <div className="h-[260px] md:h-[420px]">
                    <AlertMap alerts={alerts} onMapClick={handleMapClick} onReportIssue={() => setDrawerOpen(true)} />
                  </div>
                </div>
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
                <UpcomingActions onGoToScheduler={() => setActiveTab('scheduler')} />
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
                <FieldHealthCard />
              </motion.div>

              <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
                <AlertsList alerts={alerts} />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div key="map" {...tabFade}>
              <div className="rounded-lg border overflow-hidden bg-card shadow-sm">
                <div className="p-3 border-b">
                  <h2 className="text-sm font-semibold font-heading">Community Alert Map</h2>
                  <p className="text-xs text-muted-foreground">Tap to report an alert at that location</p>
                </div>
                <div className="h-[calc(100vh-220px)] md:h-[calc(100vh-200px)]">
                  <AlertMap alerts={alerts} onMapClick={handleMapClick} onReportIssue={() => setDrawerOpen(true)} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'weather' && (
            <motion.div key="weather" {...tabFade}>
              <WeatherPage />
            </motion.div>
          )}

          {activeTab === 'scheduler' && (
            <motion.div key="scheduler" {...tabFade}>
              <SchedulerPanel />
            </motion.div>
          )}

          {activeTab === 'pests' && (
            <motion.div key="pests" {...tabFade} className="space-y-3 md:space-y-6">
              <PestPredictionCard />
              <BugIdentifier onAlertAdded={() => setAlerts(getAlerts())} />
            </motion.div>
          )}

          {activeTab === 'advisor' && (
            <motion.div key="advisor" {...tabFade}>
              <AgroChatPanel embedded />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AddAlertDialog
        onAdd={handleAddAlert}
        defaultLat={clickedCoords?.lat}
        defaultLng={clickedCoords?.lng}
      />

      <ReportIssueDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSubmit={handleAddAlert}
      />

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
