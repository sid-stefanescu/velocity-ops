import { signal, computed, effect } from '@preact/signals';

export type TruckLogEntry = {
  id: string;
  wing: 'Left' | 'Right';
  bay?: string;
  type: 'Pallet' | 'Floor';
  timestamp: string;
};

export type ShiftBlock = {
  id: string;
  start: string;
  end: string;
  teams: number;
};

export type ShiftLogEntry = {
  id: string;
  timestamp: string;
  schedule: string;
};

// Default Schedule (for fallback)
export const defaultShiftSchedule: ShiftBlock[] = [
  { id: 's1', start: '09:30', end: '11:30', teams: 14 },
  { id: 's2', start: '12:00', end: '14:00', teams: 14 },
  { id: 's3', start: '14:30', end: '16:30', teams: 14 },
  { id: 's4', start: '17:00', end: '19:00', teams: 14 },
];

// Central Signals
export const targetTrucks = signal<number>(145);
export const historicalAnchor = signal<number>(2.5);
export const shiftSchedule = signal<ShiftBlock[]>(defaultShiftSchedule);
export const shiftHistory = signal<ShiftLogEntry[]>([]);
export const truckLog = signal<TruckLogEntry[]>([]);
export const isSidebarOpen = signal<boolean>(true); // Keep in memory or localStorage for UI

// WAVE Algo Settings
export const waveWeights = signal<{w1: number, w2: number, w3: number}>({w1: 0.6, w2: 0.3, w3: 0.1});
export const wirThresholds = signal<{warning: number, critical: number}>({warning: 0.20, critical: 0.35});

// Derived Signals
export const trucksCompleted = computed(() => truckLog.value.length);
export const leftWingCount = computed(() => truckLog.value.filter(t => t.wing === 'Left').length);
export const rightWingCount = computed(() => truckLog.value.filter(t => t.wing === 'Right').length);
export const activeTeams = computed(() => {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  for (const block of shiftSchedule.value) {
    if (timeStr >= block.start && timeStr < block.end) {
      return block.teams;
    }
  }
  return 0; // Break time
});

// Sync isSidebarOpen to LocalStorage (pure UI state)
const initSidebar = localStorage.getItem('isSidebarOpen');
if (initSidebar) isSidebarOpen.value = JSON.parse(initSidebar);
effect(() => { localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen.value)); });

// Fetch State Polling Function
const fetchState = async () => {
  try {
    const res = await fetch('/api/state');
    const data = await res.json();
    if (data.logs) truckLog.value = data.logs;
    if (data.shifts && data.shifts.length > 0) shiftSchedule.value = data.shifts;
    if (data.shiftLogs) shiftHistory.value = data.shiftLogs;
    if (data.settings) {
      targetTrucks.value = data.settings.targetTrucks;
      historicalAnchor.value = data.settings.historicalAnchor;
      waveWeights.value = { w1: data.settings.w1, w2: data.settings.w2, w3: data.settings.w3 };
      wirThresholds.value = { warning: data.settings.wirWarning, critical: data.settings.wirCritical };
    }
  } catch (err) {
    console.error('Failed to fetch state', err);
  }
};

// Initial fetch and start polling every 5 seconds
if (typeof window !== 'undefined') {
  fetchState();
  setInterval(fetchState, 5000);
}

// Actions
export const addTruck = async (wing: 'Left' | 'Right', type: 'Pallet' | 'Floor', bay?: string) => {
  // Optimistic update for immediate UI response
  const newEntry: TruckLogEntry = {
    id: 'temp-' + Date.now(),
    wing,
    bay,
    type,
    timestamp: new Date().toISOString()
  };
  truckLog.value = [...truckLog.value, newEntry];

  try {
    await fetch('/api/truck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wing, bay, type })
    });
    // Optional: could re-fetch state immediately here
  } catch (err) {
    console.error('Failed to add truck', err);
  }
};

export const addBatch = async (logs: Omit<TruckLogEntry, 'id'>[]) => {
  // Optimistic update
  const newLogs = logs.map(l => ({ ...l, id: 'temp-' + Math.random().toString(36).substring(7) }));
  truckLog.value = [...truckLog.value, ...newLogs];

  try {
    await fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs })
    });
  } catch (err) {
    console.error('Failed to add batch', err);
  }
};

export const clearData = async () => {
  truckLog.value = []; // Optimistic clear
  try {
    await fetch('/api/clear', { method: 'POST' });
  } catch (err) {
    console.error('Failed to clear data', err);
  }
};

// Save Settings Action
export const saveSettings = async (
  anchor: number, 
  target: number, 
  weights: {w1: number, w2: number, w3: number}, 
  thresholds: {warning: number, critical: number}
) => {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anchor, target, weights, thresholds })
    });
    await fetchState(); // Refresh local state
  } catch (err) {
    console.error('Failed to save settings', err);
  }
};

export const saveShiftSchedule = async (shifts: ShiftBlock[]) => {
  try {
    await fetch('/api/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shifts })
    });
    await fetchState();
  } catch (err) {
    console.error('Failed to save shift schedule', err);
  }
};
