import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { AlertType } from '@/lib/alerts-store';

interface AddAlertDialogProps {
  onAdd: (alert: { latitude: number; longitude: number; crop_type: string; alert_type: AlertType; description: string }) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export default function AddAlertDialog({ onAdd, defaultLat, defaultLng }: AddAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [crop, setCrop] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('pest');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (defaultLat !== undefined) setLat(defaultLat.toFixed(4));
    if (defaultLng !== undefined) setLng(defaultLng.toFixed(4));
    if (defaultLat !== undefined && defaultLng !== undefined) setOpen(true);
  }, [defaultLat, defaultLng]);

  const handleSubmit = () => {
    if (!lat || !lng || !crop || !desc) return;
    onAdd({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      crop_type: crop,
      alert_type: alertType,
      description: desc,
    });
    setOpen(false);
    setCrop('');
    setDesc('');
    setLat('');
    setLng('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg h-14 w-14 md:w-auto md:px-6 md:rounded-lg">
          <Plus className="h-6 w-6" />
          <span className="hidden md:inline ml-2">Report Alert</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Report Community Alert</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="28.6139" />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="77.2090" />
            </div>
          </div>
          <div>
            <Label htmlFor="crop">Crop Type</Label>
            <Input id="crop" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Wheat, Rice, Corn" />
          </div>
          <div>
            <Label>Alert Type</Label>
            <Select value={alertType} onValueChange={(v) => setAlertType(v as AlertType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pest">🐛 Pest</SelectItem>
                <SelectItem value="disease">🦠 Disease</SelectItem>
                <SelectItem value="weather">⛈️ Weather</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe what you're observing..." rows={3} />
          </div>
          <Button onClick={handleSubmit} className="w-full">Submit Alert</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
