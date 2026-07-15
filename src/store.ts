import { signal, effect, computed } from '@preact/signals';

export type TruckLogEntry = {
  id: string;
  timestamp: string; // ISO string
  wing: 'Left' | 'Right';
  type: 'Pallet' | 'Floor';
};

export type ShiftBlock = {
  id: string;
  start: string; // HH:mm
  end: string; // HH:mm
  teams: number;
};

// Default initial state
const defaultShiftSchedule: ShiftBlock[] = [
  { id: 'shift-1', start: '06:00', end: '13:00', teams: 2 },
  { id: 'shift-2', start: '13:00', end: '15:00', teams: 7 },
  { id: 'shift-3', start: '15:00', end: '23:59', teams: 5 },
];

const loadState = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// Central Signals
export const targetTrucks = signal<number>(loadState('targetTrucks', 145));
export const historicalAnchor = signal<number>(loadState('historicalAnchor', 2.5));
export const shiftSchedule = signal<ShiftBlock[]>(loadState('shiftSchedule', defaultShiftSchedule));
export const truckLog = signal<TruckLogEntry[]>(loadState('truckLog', []));
export const isSidebarOpen = signal<boolean>(loadState('isSidebarOpen', true));

// WAVE Algo Settings
export const waveWeights = signal<{w1: number, w2: number, w3: number}>(loadState('waveWeights', {w1: 0.6, w2: 0.3, w3: 0.1}));
export const wirThresholds = signal<{warning: number, critical: number}>(loadState('wirThresholds', {warning: 0.20, critical: 0.35}));

// Derived Signals
export const trucksCompleted = computed(() => truckLog.value.length);
export const leftWingCount = computed(() => truckLog.value.filter(t => t.wing === 'Left').length);
export const rightWingCount = computed(() => truckLog.value.filter(t => t.wing === 'Right').length);

export const activeTeams = computed(() => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

  for (const block of shiftSchedule.value) {
    if (currentTimeStr >= block.start && currentTimeStr < block.end) {
      return block.teams;
    }
  }
  return 0; // Default if outside schedule
});

// Sync to LocalStorage
effect(() => { localStorage.setItem('targetTrucks', JSON.stringify(targetTrucks.value)); });
effect(() => { localStorage.setItem('historicalAnchor', JSON.stringify(historicalAnchor.value)); });
effect(() => { localStorage.setItem('shiftSchedule', JSON.stringify(shiftSchedule.value)); });
effect(() => { localStorage.setItem('truckLog', JSON.stringify(truckLog.value)); });
effect(() => { localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen.value)); });
effect(() => { localStorage.setItem('waveWeights', JSON.stringify(waveWeights.value)); });
effect(() => { localStorage.setItem('wirThresholds', JSON.stringify(wirThresholds.value)); });

// Cross-tab synchronization
window.addEventListener('storage', (e) => {
  if (e.key === 'targetTrucks' && e.newValue) targetTrucks.value = JSON.parse(e.newValue);
  if (e.key === 'historicalAnchor' && e.newValue) historicalAnchor.value = JSON.parse(e.newValue);
  if (e.key === 'shiftSchedule' && e.newValue) shiftSchedule.value = JSON.parse(e.newValue);
  if (e.key === 'truckLog' && e.newValue) truckLog.value = JSON.parse(e.newValue);
  if (e.key === 'isSidebarOpen' && e.newValue) isSidebarOpen.value = JSON.parse(e.newValue);
  if (e.key === 'waveWeights' && e.newValue) waveWeights.value = JSON.parse(e.newValue);
  if (e.key === 'wirThresholds' && e.newValue) wirThresholds.value = JSON.parse(e.newValue);
});

// Actions
export const addTruck = (wing: 'Left' | 'Right', type: 'Pallet' | 'Floor') => {
  const newEntry: TruckLogEntry = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    wing,
    type,
  };
  truckLog.value = [...truckLog.value, newEntry];
};

export const clearData = () => {
  truckLog.value = [];
};
