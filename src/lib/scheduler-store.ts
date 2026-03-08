export interface ScheduledAction {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // HH:mm
  completed: boolean;
  created_at: string;
}

const STORAGE_KEY = 'agrisync_scheduled_actions';

export function getScheduledActions(): ScheduledAction[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function addScheduledAction(action: Omit<ScheduledAction, 'id' | 'completed' | 'created_at'>): ScheduledAction {
  const actions = getScheduledActions();
  const newAction: ScheduledAction = {
    ...action,
    id: crypto.randomUUID(),
    completed: false,
    created_at: new Date().toISOString(),
  };
  actions.unshift(newAction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  return newAction;
}

export function toggleScheduledAction(id: string): void {
  const actions = getScheduledActions();
  const idx = actions.findIndex((a) => a.id === id);
  if (idx !== -1) {
    actions[idx].completed = !actions[idx].completed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  }
}

export function deleteScheduledAction(id: string): void {
  const actions = getScheduledActions().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}
