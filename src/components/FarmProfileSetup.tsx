import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Check, X, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FarmProfile {
  farmName: string;
  location: { lat: number; lng: number } | null;
  locationText: string;
  farmSize: number;
  sizeUnit: 'acres' | 'hectares';
  crops: string[];
  experience: 'beginner' | 'intermediate' | 'experienced';
}

interface FarmProfileSetupProps {
  onProfileSave: (profile: FarmProfile) => void;
}

const PRESET_CROPS = ['Padi', 'Chili', 'Durian', 'Corn', 'Vegetables', 'Other'];
const EXPERIENCE_OPTIONS = [
  { value: 'beginner' as const, label: 'Beginner', desc: 'Just getting started' },
  { value: 'intermediate' as const, label: 'Intermediate', desc: '1-5 years farming' },
  { value: 'experienced' as const, label: 'Experienced', desc: '5+ years farming' },
];

export default function FarmProfileSetup({ onProfileSave }: FarmProfileSetupProps) {
  const [profile, setProfile] = useState<FarmProfile>({
    farmName: '',
    location: null,
    locationText: '',
    farmSize: 0,
    sizeUnit: 'acres',
    crops: [],
    experience: 'beginner',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [customCrop, setCustomCrop] = useState('');
  const [success, setSuccess] = useState(false);
  const cropInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(<K extends keyof FarmProfile>(key: K, val: FarmProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: val }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const handleGps = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors((e) => ({ ...e, location: 'GPS not available on this device' }));
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setProfile((p) => ({
          ...p,
          location: { lat: latitude, lng: longitude },
          locationText: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        }));
        setErrors((e) => { const n = { ...e }; delete n.location; return n; });
        setGpsLoading(false);
      },
      () => {
        setErrors((e) => ({ ...e, location: 'Unable to get location. Please enter manually.' }));
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const toggleCrop = useCallback((crop: string) => {
    setProfile((p) => {
      const has = p.crops.includes(crop);
      return { ...p, crops: has ? p.crops.filter((c) => c !== crop) : [...p.crops, crop] };
    });
    setErrors((e) => { const n = { ...e }; delete n.crops; return n; });
  }, []);

  const addCustomCrop = useCallback(() => {
    const trimmed = customCrop.trim();
    if (trimmed && !profile.crops.includes(trimmed)) {
      setProfile((p) => ({ ...p, crops: [...p.crops, trimmed] }));
      setErrors((e) => { const n = { ...e }; delete n.crops; return n; });
    }
    setCustomCrop('');
  }, [customCrop, profile.crops]);

  const handleCropKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomCrop(); }
  }, [addCustomCrop]);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!profile.farmName.trim()) errs.farmName = 'Farm name is required';
    if (!profile.locationText.trim()) errs.location = 'Location is required';
    if (!profile.farmSize || profile.farmSize <= 0) errs.farmSize = 'Enter a valid farm size';
    if (profile.crops.length === 0) errs.crops = 'Select at least one crop';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [profile]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    setSuccess(true);
    setTimeout(() => onProfileSave(profile), 2500);
  }, [validate, profile, onProfileSave]);

  if (success) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[hsl(var(--nature-light))]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6"
        >
          <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-heading font-semibold text-foreground text-center"
        >
          Your farm is ready.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mt-1 font-body"
        >
          Let's grow together.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--nature-light))]">
      <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">Welcome to AgriSync 🌱</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Tell us about your farm so we can give you personalized advice.
          </p>
        </div>

        {/* Farm Name */}
        <FieldGroup label="Farm Name" error={errors.farmName}>
          <Input
            placeholder="e.g. Ladang Pak Ali"
            value={profile.farmName}
            onChange={(e) => update('farmName', e.target.value)}
            className="h-12 text-base"
          />
        </FieldGroup>

        {/* Location */}
        <FieldGroup label="Farm Location" error={errors.location}>
          <div className="flex gap-2">
            <Input
              placeholder="Latitude, Longitude or address"
              value={profile.locationText}
              onChange={(e) => update('locationText', e.target.value)}
              className="h-12 text-base flex-1"
            />
            <Button
              variant="outline"
              className="h-12 shrink-0 gap-1.5"
              onClick={handleGps}
              disabled={gpsLoading}
            >
              {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              GPS
            </Button>
          </div>
          {profile.location && (
            <div className="mt-2 rounded-lg border bg-muted/50 p-3">
              <div className="w-full h-24 rounded-md bg-[hsl(var(--nature-light))] border flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                {profile.location.lat.toFixed(5)}, {profile.location.lng.toFixed(5)}
              </p>
            </div>
          )}
        </FieldGroup>

        {/* Farm Size */}
        <FieldGroup label="Farm Size" error={errors.farmSize}>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={profile.farmSize || ''}
              onChange={(e) => update('farmSize', parseFloat(e.target.value) || 0)}
              className="h-12 text-base flex-1"
            />
            <Button
              variant={profile.sizeUnit === 'acres' ? 'default' : 'outline'}
              className="h-12"
              onClick={() => update('sizeUnit', 'acres')}
            >
              Acres
            </Button>
            <Button
              variant={profile.sizeUnit === 'hectares' ? 'default' : 'outline'}
              className="h-12"
              onClick={() => update('sizeUnit', 'hectares')}
            >
              Hectares
            </Button>
          </div>
        </FieldGroup>

        {/* Crops */}
        <FieldGroup label="Crops Planted" error={errors.crops}>
          <div className="flex flex-wrap gap-2">
            {PRESET_CROPS.map((crop) => {
              const selected = profile.crops.includes(crop);
              return (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className={cn(
                    'h-12 px-4 rounded-full text-base font-medium border transition-colors',
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  )}
                >
                  {crop}
                </button>
              );
            })}
            {profile.crops
              .filter((c) => !PRESET_CROPS.includes(c))
              .map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className="h-12 px-4 rounded-full text-base font-medium bg-primary text-primary-foreground border border-primary flex items-center gap-1"
                >
                  {crop}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              ref={cropInputRef}
              placeholder="Add custom crop…"
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
              onKeyDown={handleCropKeyDown}
              className="h-12 text-base flex-1"
            />
            <Button variant="outline" className="h-12" onClick={addCustomCrop} disabled={!customCrop.trim()}>
              Add
            </Button>
          </div>
        </FieldGroup>

        {/* Experience */}
        <FieldGroup label="Farming Experience">
          <div className="space-y-2">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const selected = profile.experience === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('experience', opt.value)}
                  className={cn(
                    'w-full h-14 px-4 rounded-xl border text-left flex items-center justify-between transition-colors',
                    selected
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-card border-border text-foreground hover:border-primary/50'
                  )}
                >
                  <div>
                    <span className="text-base font-medium">{opt.label}</span>
                    <span className="text-sm text-muted-foreground ml-2">{opt.desc}</span>
                  </div>
                  {selected && <Check className="h-5 w-5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </FieldGroup>

        {/* Submit */}
        <Button className="w-full h-14 text-lg font-heading gap-2" onClick={handleSubmit}>
          Save & Continue
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="h-8" />
      </div>
    </div>
  );
}

function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-base font-medium">{label}</Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
