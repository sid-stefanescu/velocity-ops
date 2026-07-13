import { useMemo, useState, useEffect } from 'preact/hooks';
import { format } from 'date-fns';
import { 
  targetTrucks, 
  truckLog, 
  historicalAnchor, 
  shiftSchedule,
  trucksCompleted,
  leftWingCount,
  rightWingCount
} from '../store';
import { calculateSmoothedVelocity, projectETA, calculateWIR, getActiveShiftIntervals } from '../lib/waveEngine';

export function TvDashboard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // Update every 10s
    return () => clearInterval(timer);
  }, []);

  const logs = truckLog.value;
  const target = targetTrucks.value;
  const completed = trucksCompleted.value;
  const left = leftWingCount.value;
  const right = rightWingCount.value;

  const currentVelocity = useMemo(() => 
    calculateSmoothedVelocity(logs, shiftSchedule.value, historicalAnchor.value, now), 
  [logs, shiftSchedule.value, historicalAnchor.value, now]);

  const etaDate = useMemo(() => 
    projectETA(target - completed, currentVelocity, shiftSchedule.value, now), 
  [target, completed, currentVelocity, shiftSchedule.value, now]);

  const { wir, status: wirStatus } = useMemo(() => calculateWIR(left, right), [left, right]);

  const progressPercent = target > 0 ? Math.min(100, (completed / target) * 100) : 0;

  // Determine if ETA is late
  let isEtaLate = false;
  if (etaDate) {
    const intervals = getActiveShiftIntervals(shiftSchedule.value, now);
    const lastIntervalEnd = intervals.length > 0 ? intervals[intervals.length - 1].end : new Date();
    isEtaLate = etaDate > lastIntervalEnd;
  }

  const etaDisplay = etaDate ? format(etaDate, 'HH:mm') : '--:--';
  const etaColor = isEtaLate ? 'text-error' : 'text-[#4ade80]'; // Green if on time, Red if late

  // Tug of war calculation (0 to 100 for each side, representing percentage of total)
  const totalWings = left + right;
  const leftPercent = totalWings > 0 ? (left / totalWings) * 100 : 50;
  const rightPercent = totalWings > 0 ? (right / totalWings) * 100 : 50;

  return (
    <div class="bg-black text-white h-screen flex flex-col font-mono overflow-hidden">
      
      {/* ZONE 1: Target Tracker (Top) */}
      <div class="h-[15%] w-full flex flex-col justify-center px-12 border-b border-[#333]">
        <div class="flex justify-between items-end mb-4">
          <div class="text-4xl font-bold text-[#888]">COMPLETED: <span class="text-white">{completed}</span></div>
          <div class="text-4xl font-bold text-[#888]">TARGET: <span class="text-white">{target}</span></div>
        </div>
        <div class="w-full h-8 bg-[#222] rounded-full overflow-hidden border border-[#444]">
          <div 
            class="h-full bg-secondary transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ZONE 2: LIVE ETA (Center) */}
      <div class="h-[40%] flex flex-col items-center justify-center border-b border-[#333] relative">
        <div class="absolute top-6 left-6 flex items-center gap-4 text-[#666]">
          <span class="material-symbols-outlined text-4xl">speed</span>
          <span class="text-2xl">{currentVelocity.toFixed(2)} TRK/TM-HR</span>
        </div>
        <div class="text-[64px] font-black tracking-[0.2em] text-[#888] mb-4">LIVE ETA</div>
        <div class={`text-[200px] leading-none font-black tracking-tight ${etaColor}`}>
          {etaDisplay}
        </div>
      </div>

      {/* ZONE 3: Tug-of-War Chart (Middle-Bottom) */}
      <div class="h-[30%] flex flex-col justify-center px-16 border-b border-[#333]">
        <div class="text-3xl font-bold text-[#888] mb-8 text-center tracking-widest">WING DISTRIBUTION</div>
        
        <div class="relative w-full h-24 flex bg-[#111] border-2 border-[#333] rounded">
          {/* Center Line */}
          <div class="absolute left-1/2 top-0 bottom-0 w-2 bg-[#555] -ml-1 z-10" />

          {/* Left Bar (Blue) - grows right to left, so flex-row-reverse or align right */}
          <div class="flex-1 flex justify-end h-full">
            <div 
              class="h-full bg-secondary flex items-center justify-start px-6 transition-all duration-1000"
              style={{ width: `${leftPercent * 2}%`, maxWidth: '100%' }} // times 2 because it occupies half the screen
            >
              <span class="text-[48px] font-black">{left}</span>
            </div>
          </div>

          {/* Right Bar (Orange) - grows left to right */}
          <div class="flex-1 flex justify-start h-full">
            <div 
              class="h-full bg-[#f97316] flex items-center justify-end px-6 transition-all duration-1000"
              style={{ width: `${rightPercent * 2}%`, maxWidth: '100%' }}
            >
              <span class="text-[48px] font-black">{right}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 4: Action Banner (Bottom) */}
      <div class="h-[15%] flex items-center justify-center bg-[#111]">
        {wirStatus === 'Critical Imbalance' ? (
          <div class="w-full h-full animate-alert flex items-center justify-center bg-error text-[#ffeb3b]">
            <span class="material-symbols-outlined text-[80px] mr-6">warning</span>
            <div class="text-[56px] font-black tracking-wider text-center leading-tight">
              ROUTING ALERT: YARD IMBALANCE.<br/>
              DIRECT TRUCKS TO {left < right ? 'LEFT' : 'RIGHT'} WING DOORS.
            </div>
          </div>
        ) : wirStatus === 'Warning' ? (
          <div class="text-4xl text-[#fb923c] font-bold tracking-widest flex items-center gap-4">
            <span class="material-symbols-outlined text-[48px]">trending_up</span>
            IMBALANCE DETECTED - MONITOR YARD FLOW
          </div>
        ) : (
          <div class="text-4xl text-[#555] font-bold tracking-widest flex items-center gap-4">
            <span class="material-symbols-outlined text-[48px]">verified</span>
            YARD BALANCED
          </div>
        )}
      </div>
    </div>
  );
}
