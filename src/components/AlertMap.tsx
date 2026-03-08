import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { CommunityAlert } from '@/lib/alerts-store';

const ALERT_COLORS: Record<string, string> = {
  pest: '#e53e3e',
  disease: '#d69e2e',
  weather: '#3182ce',
};

const ALERT_ICONS: Record<string, string> = {
  pest: '🐛',
  disease: '🦠',
  weather: '⛈️',
};

function createIcon(alertType: string) {
  const color = ALERT_COLORS[alertType] || '#38a169';
  return L.divIcon({
    className: 'custom-alert-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${ALERT_ICONS[alertType] || '📍'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

interface AlertMapProps {
  alerts: CommunityAlert[];
  onMapClick?: (lat: number, lng: number) => void;
  onReportIssue?: () => void;
  className?: string;
}

export default function AlertMap({ alerts, onMapClick, onReportIssue, className = '' }: AlertMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([28.6139, 77.2090], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    alerts.forEach((alert) => {
      const marker = L.marker([alert.latitude, alert.longitude], {
        icon: createIcon(alert.alert_type),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; min-width: 180px;">
          <strong style="font-size: 14px;">${alert.crop_type}</strong>
          <span style="
            display: inline-block;
            margin-left: 6px;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            color: white;
            background: ${ALERT_COLORS[alert.alert_type]};
          ">${alert.alert_type}</span>
          <p style="margin: 8px 0 0; font-size: 13px; color: #555;">${alert.description}</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #999;">
            ${new Date(alert.created_at).toLocaleString()}
          </p>
        </div>
      `);
    });
  }, [alerts]);

  useEffect(() => {
    if (!mapRef.current || !onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    mapRef.current.on('click', handler);
    return () => {
      mapRef.current?.off('click', handler);
    };
  }, [onMapClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className={`w-full h-full min-h-[300px] rounded-lg ${className}`} />
      {onReportIssue && (
        <Button
          onClick={onReportIssue}
          size="sm"
          className="absolute top-3 left-3 z-30 shadow-lg gap-1.5"
        >
          <AlertTriangle className="h-4 w-4" />
          Report Issue
        </Button>
      )}
    </div>
  );
}
