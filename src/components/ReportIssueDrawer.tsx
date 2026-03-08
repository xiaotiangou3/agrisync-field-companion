import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { AlertType } from '@/lib/alerts-store';

interface ReportIssueDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { latitude: number; longitude: number; crop_type: string; alert_type: AlertType; description: string }) => void;
  defaultLat?: number;
  defaultLng?: number;
}

const PEST_DISEASE_OPTIONS = [
  { value: 'pest', label: '🐛 Aphids' },
  { value: 'pest', label: '🦗 Locusts' },
  { value: 'pest', label: '🐛 Whitefly' },
  { value: 'pest', label: '🐛 Stem Borer' },
  { value: 'disease', label: '🦠 Blast Disease' },
  { value: 'disease', label: '🦠 Rust' },
  { value: 'disease', label: '🦠 Blight' },
  { value: 'disease', label: '🦠 Wilt' },
  { value: 'weather', label: '⛈️ Heavy Rainfall' },
  { value: 'weather', label: '🌡️ Heat Stress' },
];

export default function ReportIssueDrawer({ open, onOpenChange, onSubmit, defaultLat, defaultLng }: ReportIssueDrawerProps) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [crop, setCrop] = useState('');
  const [issueIndex, setIssueIndex] = useState('');
  const [desc, setDesc] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (defaultLat !== undefined && defaultLng !== undefined) {
      setLat(defaultLat.toFixed(4));
      setLng(defaultLng.toFixed(4));
    } else {
      fetchGPS();
    }
  }, [open, defaultLat, defaultLng]);

  const fetchGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLng(pos.coords.longitude.toFixed(4));
        setLocating(false);
        toast.success('GPS location captured');
      },
      () => {
        setLocating(false);
        toast.error('Unable to get location. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    if (!lat || !lng || !crop || !issueIndex || !desc) {
      toast.error('Please fill all fields');
      return;
    }
    const issue = PEST_DISEASE_OPTIONS[parseInt(issueIndex)];
    onSubmit({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      crop_type: crop,
      alert_type: issue.value as AlertType,
      description: `${issue.label.slice(2).trim()}: ${desc}`,
    });
    toast.success('Alert reported successfully! 🌱');
    onOpenChange(false);
    setCrop('');
    setIssueIndex('');
    setDesc('');
    setLat('');
    setLng('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-heading">Report Issue</DrawerTitle>
          <DrawerDescription>Report a pest, disease, or weather issue at your location.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4 overflow-y-auto">
          {/* GPS Location */}
          <div className="flex items-end gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="r-lat" className="text-xs">Latitude</Label>
                <Input id="r-lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="28.6139" />
              </div>
              <div>
                <Label htmlFor="r-lng" className="text-xs">Longitude</Label>
                <Input id="r-lng" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="77.2090" />
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={fetchGPS} disabled={locating} className="shrink-0">
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            </Button>
          </div>

          <div>
            <Label htmlFor="r-crop" className="text-xs">Crop Type</Label>
            <Input id="r-crop" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Wheat, Rice, Corn" />
          </div>

          <div>
            <Label className="text-xs">Issue Type</Label>
            <Select value={issueIndex} onValueChange={setIssueIndex}>
              <SelectTrigger>
                <SelectValue placeholder="Select pest or disease..." />
              </SelectTrigger>
              <SelectContent>
                {PEST_DISEASE_OPTIONS.map((opt, i) => (
                  <SelectItem key={i} value={String(i)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="r-desc" className="text-xs">Description</Label>
            <Textarea id="r-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What are you observing?" rows={3} />
          </div>

          <Button onClick={handleSubmit} className="w-full" size="lg">
            Submit Report
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
