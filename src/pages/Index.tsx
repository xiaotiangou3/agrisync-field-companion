import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import AlertMap from '@/components/AlertMap';
import FieldHealthCard from '@/components/FieldHealthCard';
import AlertsList from '@/components/AlertsList';
import AddAlertDialog from '@/components/AddAlertDialog';
import ReportIssueDrawer from '@/components/ReportIssueDrawer';
import StatsBar from '@/components/StatsBar';
import { getAlerts, addAlert, type AlertType } from '@/lib/alerts-store';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function Index() {
  const [alerts, setAlerts] = useState(getAlerts);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

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
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-4 md:py-6 space-y-4 md:space-y-6 pb-24">
        {/* Stats */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <StatsBar alerts={alerts} />
        </motion.div>

        {/* Map */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <div className="rounded-lg border overflow-hidden bg-card shadow-sm">
            <div className="p-3 border-b">
              <h2 className="text-sm font-semibold font-heading">Community Alert Map</h2>
              <p className="text-xs text-muted-foreground">Tap the map to report an alert at that location</p>
            </div>
            <div className="h-[300px] md:h-[420px]">
              <AlertMap alerts={alerts} onMapClick={handleMapClick} />
            </div>
          </div>
        </motion.div>

        {/* Two column layout on desktop */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <FieldHealthCard />
          </motion.div>
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <AlertsList alerts={alerts} />
          </motion.div>
        </div>
      </main>

      <AddAlertDialog
        onAdd={handleAddAlert}
        defaultLat={clickedCoords?.lat}
        defaultLng={clickedCoords?.lng}
      />
    </div>
  );
}
