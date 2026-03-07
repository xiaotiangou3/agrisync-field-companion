export type AlertType = 'pest' | 'disease' | 'weather';

export interface CommunityAlert {
  id: string;
  created_at: string;
  user_id: string;
  latitude: number;
  longitude: number;
  crop_type: string;
  alert_type: AlertType;
  description: string;
}

const STORAGE_KEY = 'agrisync_alerts';

const SEED_ALERTS: CommunityAlert[] = [
  {
    id: '1',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_id: 'demo',
    latitude: 28.6139,
    longitude: 77.2090,
    crop_type: 'Wheat',
    alert_type: 'pest',
    description: 'Aphid infestation spotted on wheat crop. Immediate action needed.',
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user_id: 'demo',
    latitude: 28.5355,
    longitude: 77.3910,
    crop_type: 'Rice',
    alert_type: 'disease',
    description: 'Blast disease symptoms observed. Yellowing leaves spreading.',
  },
  {
    id: '3',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    user_id: 'demo',
    latitude: 28.7041,
    longitude: 77.1025,
    crop_type: 'Corn',
    alert_type: 'weather',
    description: 'Heavy rainfall expected. Risk of waterlogging in low-lying fields.',
  },
  {
    id: '4',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    user_id: 'demo',
    latitude: 28.4595,
    longitude: 77.0266,
    crop_type: 'Tomato',
    alert_type: 'pest',
    description: 'Whitefly population increasing. Consider biological controls.',
  },
  {
    id: '5',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    user_id: 'demo',
    latitude: 28.6692,
    longitude: 77.4538,
    crop_type: 'Soybean',
    alert_type: 'disease',
    description: 'Rust detected on lower leaves. Fungicide application recommended.',
  },
];

export function getAlerts(): CommunityAlert[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ALERTS));
    return SEED_ALERTS;
  }
  return JSON.parse(stored);
}

export function addAlert(alert: Omit<CommunityAlert, 'id' | 'created_at' | 'user_id'>): CommunityAlert {
  const alerts = getAlerts();
  const newAlert: CommunityAlert = {
    ...alert,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: 'demo',
  };
  alerts.unshift(newAlert);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  return newAlert;
}
