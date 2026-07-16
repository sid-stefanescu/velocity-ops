import { useState } from 'preact/hooks';
import { shiftSchedule, historicalAnchor, targetTrucks, clearData, waveWeights, wirThresholds, saveSettings } from '../store';
import type { ShiftBlock } from '../store';

export function AdminSettings() {
  const [schedule, setSchedule] = useState<ShiftBlock[]>([...shiftSchedule.value]);
  const [anchor, setAnchor] = useState(historicalAnchor.value);
  const [target, setTarget] = useState(targetTrucks.value);
  const [weights, setWeights] = useState({...waveWeights.value});
  const [thresholds, setThresholds] = useState({...wirThresholds.value});

  const handleSave = async () => {
    await saveSettings(schedule, anchor, target, weights, thresholds);
    alert('Settings Saved Successfully!');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all truck data for today?')) {
      clearData();
      alert('Data cleared.');
    }
  };

  const updateShift = (index: number, field: keyof ShiftBlock, value: string | number) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const addShift = () => {
    setSchedule([...schedule, { id: Date.now().toString(), start: '00:00', end: '00:00', teams: 0 }]);
  };

  const removeShift = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  return (
    <div class="bg-surface text-on-surface min-h-screen p-8 font-body-lg">
      <div class="max-w-2xl mx-auto flex flex-col gap-8">
        <h1 class="font-headline-lg text-headline-lg font-bold text-primary">System Settings</h1>
        
        <div class="bg-white p-6 rounded border border-outline-variant shadow-sm flex flex-col gap-4">
          <h2 class="font-headline-md text-headline-md">Global Configuration</h2>
          
          <div>
            <label class="block font-label-caps text-label-caps mb-2">Daily Truck Target</label>
            <input 
              type="number" 
              value={target}
              onInput={(e) => setTarget(Number((e.target as HTMLInputElement).value))}
              class="w-full p-2 border border-outline-variant rounded"
            />
          </div>

          <div>
            <label class="block font-label-caps text-label-caps mb-2">Historical Anchor (Trucks/Team-Hr)</label>
            <input 
              type="number" 
              step="0.1"
              value={anchor}
              onInput={(e) => setAnchor(Number((e.target as HTMLInputElement).value))}
              class="w-full p-2 border border-outline-variant rounded"
            />
          </div>

          <h3 class="font-headline-sm mt-4">WAVE Algorithm (C2HRA Weights)</h3>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block font-label-caps text-[10px] mb-1">0-2h Weight</label>
              <input 
                type="number" step="0.1" value={weights.w1}
                onInput={(e) => setWeights({...weights, w1: Number((e.target as HTMLInputElement).value)})}
                class="w-full p-2 border border-outline-variant rounded"
              />
            </div>
            <div>
              <label class="block font-label-caps text-[10px] mb-1">2-4h Weight</label>
              <input 
                type="number" step="0.1" value={weights.w2}
                onInput={(e) => setWeights({...weights, w2: Number((e.target as HTMLInputElement).value)})}
                class="w-full p-2 border border-outline-variant rounded"
              />
            </div>
            <div>
              <label class="block font-label-caps text-[10px] mb-1">4-6h Weight</label>
              <input 
                type="number" step="0.1" value={weights.w3}
                onInput={(e) => setWeights({...weights, w3: Number((e.target as HTMLInputElement).value)})}
                class="w-full p-2 border border-outline-variant rounded"
              />
            </div>
          </div>

          <h3 class="font-headline-sm mt-4">Spatial Diagnostics (WIR) Thresholds</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-label-caps text-[10px] mb-1">Warning Threshold</label>
              <input 
                type="number" step="0.05" value={thresholds.warning}
                onInput={(e) => setThresholds({...thresholds, warning: Number((e.target as HTMLInputElement).value)})}
                class="w-full p-2 border border-outline-variant rounded"
              />
            </div>
            <div>
              <label class="block font-label-caps text-[10px] mb-1">Critical Threshold</label>
              <input 
                type="number" step="0.05" value={thresholds.critical}
                onInput={(e) => setThresholds({...thresholds, critical: Number((e.target as HTMLInputElement).value)})}
                class="w-full p-2 border border-outline-variant rounded"
              />
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded border border-outline-variant shadow-sm flex flex-col gap-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-headline-md text-headline-md">Shift Schedule</h2>
            <button onClick={addShift} class="bg-secondary text-white px-3 py-1 rounded text-sm">+ Add Shift</button>
          </div>

          {schedule.map((shift, i) => (
            <div key={shift.id} class="flex items-center gap-4 bg-surface-container-low p-4 rounded border border-outline-variant">
              <div>
                <label class="block font-label-caps text-[10px] mb-1">Start Time</label>
                <input 
                  type="time" 
                  value={shift.start}
                  onInput={(e) => updateShift(i, 'start', (e.target as HTMLInputElement).value)}
                  class="p-2 border border-outline-variant rounded"
                />
              </div>
              <div>
                <label class="block font-label-caps text-[10px] mb-1">End Time</label>
                <input 
                  type="time" 
                  value={shift.end}
                  onInput={(e) => updateShift(i, 'end', (e.target as HTMLInputElement).value)}
                  class="p-2 border border-outline-variant rounded"
                />
              </div>
              <div class="flex-1">
                <label class="block font-label-caps text-[10px] mb-1">Active Teams</label>
                <input 
                  type="number" 
                  value={shift.teams}
                  onInput={(e) => updateShift(i, 'teams', Number((e.target as HTMLInputElement).value))}
                  class="w-full p-2 border border-outline-variant rounded"
                />
              </div>
              <button onClick={() => removeShift(i)} class="text-error mt-4 p-2 material-symbols-outlined hover:bg-error-container rounded">delete</button>
            </div>
          ))}
        </div>

        <div class="flex justify-between">
          <button onClick={handleClear} class="border border-error text-error px-6 py-3 rounded font-bold hover:bg-error-container">CLEAR TODAYS DATA</button>
          <button onClick={handleSave} class="bg-secondary text-white px-6 py-3 rounded font-bold hover:bg-secondary-container">SAVE SETTINGS</button>
        </div>
      </div>
    </div>
  );
}
