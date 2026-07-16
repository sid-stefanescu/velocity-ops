import { useState } from 'preact/hooks';
import { shiftSchedule, shiftHistory, historicalAnchor, targetTrucks, clearData, waveWeights, wirThresholds, saveSettings, saveShiftSchedule } from '../store';
import type { ShiftBlock } from '../store';
import { format } from 'date-fns';

export function AdminSettings() {
  const [schedule, setSchedule] = useState<ShiftBlock[]>([...shiftSchedule.value]);
  const [anchor, setAnchor] = useState(historicalAnchor.value);
  const [target, setTarget] = useState(targetTrucks.value);
  const [weights, setWeights] = useState({...waveWeights.value});
  const [thresholds, setThresholds] = useState({...wirThresholds.value});

  const handleSaveSettings = async () => {
    await saveSettings(anchor, target, weights, thresholds);
    alert('Global Settings Saved Successfully!');
  };

  const handleSaveShifts = async () => {
    await saveShiftSchedule(schedule);
    alert('Shift Schedule Updated and Logged!');
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
            <label class="block font-label-caps text-label-caps mb-2">Shift Volume Target</label>
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

          <button onClick={handleSaveSettings} class="bg-secondary text-white px-6 py-3 rounded font-bold hover:bg-secondary-container mt-4 self-end">SAVE SETTINGS</button>
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
          <button onClick={handleSaveShifts} class="bg-primary text-white px-6 py-3 rounded font-bold hover:bg-[#3d4b68] mt-4 self-end">UPDATE SCHEDULE</button>
        </div>

        {/* Shift History Section */}
        <div class="bg-white p-6 rounded border border-outline-variant shadow-sm flex flex-col gap-4">
          <h2 class="font-headline-md text-headline-md">Shift Update History</h2>
          {shiftHistory.value.length === 0 ? (
            <p class="text-on-surface-variant font-label-caps text-label-caps">No update history found.</p>
          ) : (
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-outline-variant">
                    <th class="p-2 font-label-caps text-label-caps text-on-surface-variant">Update Time</th>
                    <th class="p-2 font-label-caps text-label-caps text-on-surface-variant">Schedule Configuration</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftHistory.value.map(log => {
                    const date = new Date(log.timestamp);
                    let parsed = [];
                    try { parsed = JSON.parse(log.schedule); } catch (e) {}
                    return (
                      <tr key={log.id} class="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors">
                        <td class="p-2 font-mono text-sm whitespace-nowrap">{format(date, 'MMM dd, HH:mm:ss')}</td>
                        <td class="p-2 text-sm text-on-surface-variant">
                          <ul class="m-0 pl-4">
                            {parsed.map((s: any, idx: number) => (
                              <li key={idx}>{s.start} - {s.end} ({s.teams} teams)</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div class="bg-error-container p-6 rounded border border-error shadow-sm flex flex-col gap-4">
          <h2 class="font-headline-md text-headline-md text-error">Danger Zone</h2>
          <p class="text-on-surface-variant text-sm">Clearing today's data will permanently remove all truck logs for the current session. This cannot be undone.</p>
          <button onClick={handleClear} class="bg-error text-white px-6 py-3 rounded font-bold hover:bg-red-700 self-start">CLEAR TODAYS DATA</button>
        </div>
      </div>
    </div>
  );
}
