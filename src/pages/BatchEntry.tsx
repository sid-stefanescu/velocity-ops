import { useState } from 'preact/hooks';
import { Sidebar } from '../components/Sidebar';
import { TopAppBar } from '../components/TopAppBar';
import { truckLog, isSidebarOpen, addBatch } from '../store';
import type { TruckLogEntry } from '../store';
import { setHours, setMinutes, addMinutes, format } from 'date-fns';

const INTERVALS = [
  { label: '07:30 - 09:30', startH: 7, startM: 30 },
  { label: '09:30 - 11:30', startH: 9, startM: 30 },
  { label: '11:30 - 13:30', startH: 11, startM: 30 },
  { label: '13:30 - 15:30', startH: 13, startM: 30 },
  { label: '15:30 - 17:30', startH: 15, startM: 30 },
  { label: '17:30 - 19:30', startH: 17, startM: 30 },
  { label: '19:30 - 21:30', startH: 19, startM: 30 },
  { label: '21:30 - 23:30', startH: 21, startM: 30 },
];

export function BatchEntry() {
  const [selectedInterval, setSelectedInterval] = useState(1); // Default to 09:30 - 11:30
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    const interval = INTERVALS[selectedInterval];
    let baseDate = new Date();
    baseDate = setHours(baseDate, interval.startH);
    baseDate = setMinutes(baseDate, interval.startM);
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    const totalMinutes = 120;
    const newLogs: TruckLogEntry[] = [];
    
    if (leftCount > 0) {
      const leftStep = totalMinutes / (leftCount + 1);
      for (let i = 1; i <= leftCount; i++) {
        const time = addMinutes(baseDate, leftStep * i).toISOString();
        newLogs.push({ id: Math.random().toString(), timestamp: time, wing: 'Left', type: 'Floor' });
      }
    }
    
    if (rightCount > 0) {
      const rightStep = totalMinutes / (rightCount + 1);
      for (let i = 1; i <= rightCount; i++) {
        const time = addMinutes(baseDate, rightStep * i).toISOString();
        newLogs.push({ id: Math.random().toString(), timestamp: time, wing: 'Right', type: 'Floor' });
      }
    }

    if (newLogs.length > 0) {
      addBatch(newLogs.map(l => ({ wing: l.wing, type: l.type, timestamp: l.timestamp })));
    }

    alert(`Successfully batched ${leftCount + rightCount} trucks for ${interval.label}`);
    setLeftCount(0);
    setRightCount(0);
  };

  return (
    <div class="flex h-screen bg-surface w-full overflow-hidden">
      <Sidebar />
      <div class={`flex-1 ${isSidebarOpen.value ? 'ml-64' : 'ml-[80px]'} transition-all duration-300 flex flex-col h-full relative`}>
        <TopAppBar />
        <main class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative">
          
          <div class="max-w-2xl mx-auto">
            <div class="mb-10">
              <h1 class="font-headline-lg text-headline-lg text-primary m-0 p-0 mb-2">Batch Data Entry</h1>
              <p class="font-body-lg text-body-lg text-on-surface-variant m-0 p-0">
                Log aggregated truck counts for specific 2-hour windows. The system will evenly distribute their unload timestamps across the window.
              </p>
            </div>

            <form onSubmit={handleSubmit} class="bg-white border border-outline-variant p-8 rounded shadow-sm flex flex-col gap-8">
              
              <div class="flex flex-col gap-2">
                <label class="font-label-caps text-label-caps text-on-surface-variant">TIME WINDOW</label>
                <select 
                  value={selectedInterval} 
                  onChange={(e) => setSelectedInterval(Number((e.target as HTMLSelectElement).value))}
                  class="p-4 border border-outline-variant rounded bg-surface-container-lowest font-body-lg text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 outline-none transition-all"
                >
                  {INTERVALS.map((int, i) => (
                    <option key={i} value={i}>{int.label}</option>
                  ))}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="font-label-caps text-label-caps text-on-surface-variant">LEFT WING TRUCKS</label>
                  <input 
                    type="number" 
                    min="0"
                    value={leftCount}
                    onInput={(e) => setLeftCount(Number((e.target as HTMLInputElement).value))}
                    class="p-4 border border-outline-variant rounded font-data-display text-4xl text-center focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 outline-none transition-all"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-label-caps text-label-caps text-on-surface-variant">RIGHT WING TRUCKS</label>
                  <input 
                    type="number" 
                    min="0"
                    value={rightCount}
                    onInput={(e) => setRightCount(Number((e.target as HTMLInputElement).value))}
                    class="p-4 border border-outline-variant rounded font-data-display text-4xl text-center focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={leftCount === 0 && rightCount === 0}
                class="mt-4 bg-secondary text-white py-4 px-6 rounded font-label-caps text-label-caps tracking-widest hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">playlist_add_check</span>
                LOG BATCH ENTRY
              </button>
            </form>

            <div class="mt-12">
              <h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Batch Logs</h2>
              <div class="bg-white border border-outline-variant rounded overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-surface-container-lowest border-b border-outline-variant">
                      <th class="p-4 font-label-caps text-label-caps text-on-surface-variant">Time</th>
                      <th class="p-4 font-label-caps text-label-caps text-on-surface-variant">Wing</th>
                      <th class="p-4 font-label-caps text-label-caps text-on-surface-variant">Type</th>
                      <th class="p-4 font-label-caps text-label-caps text-on-surface-variant">Bay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {truckLog.value.slice(-15).reverse().map(log => (
                      <tr key={log.id} class="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                        <td class="p-4 font-body-md text-on-surface">{format(new Date(log.timestamp), 'MMM dd, HH:mm')}</td>
                        <td class="p-4 font-body-md text-on-surface">{log.wing}</td>
                        <td class="p-4 font-body-md text-on-surface">{log.type}</td>
                        <td class="p-4 font-body-md text-on-surface-variant">{log.bay || '-'}</td>
                      </tr>
                    ))}
                    {truckLog.value.length === 0 && (
                      <tr>
                        <td colSpan={4} class="p-8 text-center text-on-surface-variant font-body-md">
                          No logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
