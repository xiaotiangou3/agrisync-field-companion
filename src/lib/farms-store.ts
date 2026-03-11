import { type FarmProfile } from '@/components/FarmProfileSetup';

const STORAGE_KEY = 'agrisync_farms';
const ACTIVE_KEY = 'agrisync_active_farm';

export interface StoredFarm extends FarmProfile {
  id: string;
  createdAt: string;
}

function generateId(): string {
  return `farm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getFarms(): StoredFarm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate legacy single profile
      const legacy = localStorage.getItem('agrisync_farm_profile');
      if (legacy) {
        const profile = JSON.parse(legacy) as FarmProfile;
        const farm: StoredFarm = { ...profile, id: generateId(), createdAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([farm]));
        localStorage.setItem(ACTIVE_KEY, farm.id);
        return [farm];
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addFarm(profile: FarmProfile): StoredFarm {
  const farms = getFarms();
  const farm: StoredFarm = { ...profile, id: generateId(), createdAt: new Date().toISOString() };
  farms.push(farm);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  if (farms.length === 1) localStorage.setItem(ACTIVE_KEY, farm.id);
  // Also update legacy key for compatibility
  localStorage.setItem('agrisync_farm_profile', JSON.stringify(profile));
  return farm;
}

export function updateFarm(id: string, profile: Partial<FarmProfile>): StoredFarm | null {
  const farms = getFarms();
  const idx = farms.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  farms[idx] = { ...farms[idx], ...profile };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  return farms[idx];
}

export function deleteFarm(id: string): void {
  const farms = getFarms().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  const activeId = localStorage.getItem(ACTIVE_KEY);
  if (activeId === id) {
    localStorage.setItem(ACTIVE_KEY, farms[0]?.id ?? '');
  }
}

export function getActiveFarmId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveFarm(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
  const farm = getFarms().find((f) => f.id === id);
  if (farm) {
    localStorage.setItem('agrisync_farm_profile', JSON.stringify(farm));
  }
}
