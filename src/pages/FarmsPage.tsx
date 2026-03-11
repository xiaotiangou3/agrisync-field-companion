import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MapPin, Ruler, Sprout, Star, Trash2, Pencil, ChevronRight, Tractor, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  getFarms, addFarm, updateFarm, deleteFarm, getActiveFarmId, setActiveFarm,
  type StoredFarm,
} from '@/lib/farms-store';
import { type FarmProfile } from '@/components/FarmProfileSetup';
import { useNavigate } from 'react-router-dom';

const PRESET_CROPS = ['Padi', 'Chili', 'Durian', 'Corn', 'Vegetables', 'Other'];

export default function FarmsPage() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<StoredFarm[]>(getFarms);
  const [activeFarmId, setActiveFarmId] = useState<string | null>(getActiveFarmId);
  const [editingFarm, setEditingFarm] = useState<StoredFarm | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoredFarm | null>(null);

  const refresh = useCallback(() => {
    setFarms(getFarms());
    setActiveFarmId(getActiveFarmId());
  }, []);

  const handleSetActive = useCallback((id: string) => {
    setActiveFarm(id);
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteFarm(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  }, [deleteTarget, refresh]);

  const handleSaveNew = useCallback((profile: FarmProfile) => {
    addFarm(profile);
    setShowAddDialog(false);
    refresh();
  }, [refresh]);

  const handleSaveEdit = useCallback((profile: FarmProfile) => {
    if (!editingFarm) return;
    updateFarm(editingFarm.id, profile);
    setEditingFarm(null);
    refresh();
  }, [editingFarm, refresh]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
              <Tractor className="h-6 w-6 text-primary" />
              My Farms
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {farms.length} farm{farms.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <Button className="gap-1.5" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Farm
          </Button>
        </div>

        {/* Empty state */}
        {farms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-border p-8 text-center"
          >
            <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-heading font-semibold text-foreground">No farms yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Add your first farm to get personalized advice.
            </p>
            <Button onClick={() => navigate('/onboarding')} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Set Up Your Farm
            </Button>
          </motion.div>
        )}

        {/* Farm Cards */}
        <AnimatePresence>
          {farms.map((farm, i) => {
            const isActive = farm.id === activeFarmId;
            return (
              <motion.div
                key={farm.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
                layout
              >
                <Card
                  className={cn(
                    'relative overflow-hidden transition-shadow',
                    isActive && 'ring-2 ring-primary shadow-md'
                  )}
                >
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  )}
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-heading truncate flex items-center gap-2">
                        {farm.farmName || 'Unnamed Farm'}
                        {isActive && (
                          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      {farm.locationText && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {farm.locationText}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <DetailItem
                        icon={<Ruler className="h-4 w-4 text-primary" />}
                        label="Size"
                        value={`${farm.farmSize} ${farm.sizeUnit}`}
                      />
                      <DetailItem
                        icon={<Star className="h-4 w-4 text-accent" />}
                        label="Experience"
                        value={farm.experience}
                      />
                    </div>

                    {/* Crops */}
                    {farm.crops.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">Crops</p>
                        <div className="flex flex-wrap gap-1.5">
                          {farm.crops.map((crop) => (
                            <Badge key={crop} variant="secondary" className="text-xs bg-[hsl(var(--nature-light))] text-foreground border-[hsl(var(--nature)/0.2)]">
                              <Sprout className="h-3 w-3 mr-1 text-primary" />
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {!isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 flex-1"
                          onClick={() => handleSetActive(farm.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Set Active
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setEditingFarm(farm)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(farm)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Farm Dialog */}
      <FarmFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveNew}
        title="Add New Farm"
      />

      {/* Edit Farm Dialog */}
      <FarmFormDialog
        open={!!editingFarm}
        onOpenChange={(open) => { if (!open) setEditingFarm(null); }}
        onSave={handleSaveEdit}
        title="Edit Farm"
        initialData={editingFarm ?? undefined}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Farm</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.farmName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Detail item helper ── */
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-medium capitalize truncate">{value}</p>
      </div>
    </div>
  );
}

/* ── Farm Form Dialog ── */
interface FarmFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: FarmProfile) => void;
  title: string;
  initialData?: FarmProfile;
}

function FarmFormDialog({ open, onOpenChange, onSave, title, initialData }: FarmFormDialogProps) {
  const [form, setForm] = useState<FarmProfile>(
    initialData ?? {
      farmName: '', location: null, locationText: '', farmSize: 0,
      sizeUnit: 'acres', crops: [], experience: 'beginner',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customCrop, setCustomCrop] = useState('');

  // Reset form when dialog opens with new data
  const lastInitial = useState(initialData)[0];
  if (initialData && initialData !== lastInitial) {
    setForm(initialData);
  }

  const update = <K extends keyof FarmProfile>(key: K, val: FarmProfile[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const toggleCrop = (crop: string) => {
    setForm((p) => ({
      ...p,
      crops: p.crops.includes(crop) ? p.crops.filter((c) => c !== crop) : [...p.crops, crop],
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.farmName.trim()) errs.farmName = 'Required';
    if (!form.farmSize || form.farmSize <= 0) errs.farmSize = 'Enter valid size';
    if (form.crops.length === 0) errs.crops = 'Select at least one crop';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
    setForm({ farmName: '', location: null, locationText: '', farmSize: 0, sizeUnit: 'acres', crops: [], experience: 'beginner' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          <DialogDescription>Fill in your farm details below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Farm Name */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">Farm Name</Label>
            <Input
              placeholder="e.g. Ladang Pak Ali"
              value={form.farmName}
              onChange={(e) => update('farmName', e.target.value)}
              className="h-12"
            />
            {errors.farmName && <p className="text-xs text-destructive">{errors.farmName}</p>}
          </div>

          {/* Location */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">Location</Label>
            <Input
              placeholder="Latitude, Longitude or address"
              value={form.locationText}
              onChange={(e) => update('locationText', e.target.value)}
              className="h-12"
            />
          </div>

          {/* Size */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">Farm Size</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0"
                min={0}
                value={form.farmSize || ''}
                onChange={(e) => update('farmSize', parseFloat(e.target.value) || 0)}
                className="h-12 flex-1"
              />
              <Button
                type="button"
                variant={form.sizeUnit === 'acres' ? 'default' : 'outline'}
                className="h-12"
                onClick={() => update('sizeUnit', 'acres')}
              >
                Acres
              </Button>
              <Button
                type="button"
                variant={form.sizeUnit === 'hectares' ? 'default' : 'outline'}
                className="h-12"
                onClick={() => update('sizeUnit', 'hectares')}
              >
                Ha
              </Button>
            </div>
            {errors.farmSize && <p className="text-xs text-destructive">{errors.farmSize}</p>}
          </div>

          {/* Crops */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Crops</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CROPS.map((crop) => {
                const selected = form.crops.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleCrop(crop)}
                    className={cn(
                      'h-10 px-3 rounded-full text-sm font-medium border transition-colors',
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:border-primary/50'
                    )}
                  >
                    {crop}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Custom crop…"
                value={customCrop}
                onChange={(e) => setCustomCrop(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = customCrop.trim();
                    if (trimmed && !form.crops.includes(trimmed)) {
                      setForm((p) => ({ ...p, crops: [...p.crops, trimmed] }));
                    }
                    setCustomCrop('');
                  }
                }}
                className="h-10 flex-1"
              />
            </div>
            {errors.crops && <p className="text-xs text-destructive">{errors.crops}</p>}
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Experience</Label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'experienced'] as const).map((exp) => (
                <Button
                  key={exp}
                  type="button"
                  variant={form.experience === exp ? 'default' : 'outline'}
                  className="flex-1 h-10 capitalize text-sm"
                  onClick={() => update('experience', exp)}
                >
                  {exp}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button className="w-full h-12 mt-2 gap-1.5" onClick={handleSubmit}>
          Save Farm
          <ChevronRight className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
