import { useEffect, useState, useMemo } from 'preact/hooks'
import { differenceInMinutes, format, setHours, setMinutes, addHours, isWithinInterval } from 'date-fns'
import { Sidebar } from '../components/Sidebar'
import { TopAppBar } from '../components/TopAppBar'
import { 
  targetTrucks, 
  truckLog, 
  historicalAnchor, 
  shiftSchedule,
  trucksCompleted,
  leftWingCount,
  rightWingCount,
  isSidebarOpen,
  waveWeights,
  wirThresholds
} from '../store'
import { calculateSmoothedVelocity, projectETA, calculateWIR } from '../lib/waveEngine'

export function FloorOperations() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const logs = truckLog.value;
  const target = targetTrucks.value;
  const completed = trucksCompleted.value;
  const left = leftWingCount.value;
  const right = rightWingCount.value;
  
  const currentVelocity = useMemo(() => 
    calculateSmoothedVelocity(logs, shiftSchedule.value, historicalAnchor.value, waveWeights.value, time), 
  [logs, shiftSchedule.value, historicalAnchor.value, waveWeights.value, time]);

  const etaDate = useMemo(() => 
    projectETA(target - completed, currentVelocity, shiftSchedule.value, time), 
  [target, completed, currentVelocity, shiftSchedule.value, time]);

  const { wir, status: wirStatus } = useMemo(() => calculateWIR(left, right, wirThresholds.value), [left, right, wirThresholds.value]);
  
  const timeRem = etaDate ? Math.max(0, differenceInMinutes(etaDate, time)) : 0;

  const truckWindows = useMemo(() => {
    const windows = [];
    let currentStart = setMinutes(setHours(time, 9), 30); // 09:30
    for (let i = 0; i < 3; i++) {
      const currentEnd = addHours(currentStart, 2);
      // Ensure log timestamp is a Date object and check if it falls in interval
      const count = logs.filter(log => {
        try {
          return isWithinInterval(new Date(log.timestamp), { start: currentStart, end: currentEnd })
        } catch(e) {
          return false;
        }
      }).length;
      
      const targetWindow = 8; // Arbitrary target for each 2h block
      const progress = Math.min((count / targetWindow) * 100, 100);
      
      let state = 'future';
      if (time > currentEnd) state = 'past';
      else if (time >= currentStart && time <= currentEnd) state = 'active';

      windows.push({
        startStr: format(currentStart, 'HH:mm'),
        count,
        target: targetWindow,
        progress,
        state
      });
      currentStart = currentEnd;
    }
    return windows;
  }, [logs, time]);

  // Dynamic Graph Math
  const graphData = useMemo(() => {
    const schedule = shiftSchedule.value;
    if (schedule.length === 0) return null;
    
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return setMinutes(setHours(new Date(), h), m);
    };

    const firstShiftStart = parseTime(schedule[0].start);
    let lastShiftEnd = parseTime(schedule[schedule.length - 1].end);
    
    let xMaxTime = lastShiftEnd;
    if (time > xMaxTime) xMaxTime = time;
    if (etaDate && etaDate > xMaxTime) xMaxTime = etaDate;
    xMaxTime = addHours(xMaxTime, 1);

    const totalDurationMs = xMaxTime.getTime() - firstShiftStart.getTime();

    const mapX = (d: Date) => {
      const elapsed = d.getTime() - firstShiftStart.getTime();
      return Math.min(100, Math.max(0, (elapsed / totalDurationMs) * 100));
    };

    const yMax = target > 0 ? target * 1.1 : 1; 
    const mapY = (val: number) => {
      return 100 - (val / yMax) * 100;
    };

    const pStartX = mapX(firstShiftStart);
    const pStartY = mapY(0);
    const pEndX = mapX(lastShiftEnd);
    const pEndY = mapY(target);
    const projectedPathD = `M ${pStartX} ${pStartY} L ${pEndX} ${pEndY}`;

    const sortedLogs = [...logs]
      .filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    let currentCount = 0;
    let actualPoints = [[mapX(firstShiftStart), mapY(0)]];
    
    for (const log of sortedLogs) {
      currentCount++;
      const logDate = new Date(log.timestamp);
      if (logDate >= firstShiftStart) {
         actualPoints.push([mapX(logDate), mapY(currentCount)]);
      }
    }
    
    if (time >= firstShiftStart) {
       actualPoints.push([mapX(time), mapY(currentCount)]);
    }

    const actualPathD = `M ${actualPoints.map(p => `${p[0]} ${p[1]}`).join(' L ')}`;

    let variancePolygonD = '';
    if (actualPoints.length > 0) {
      const getProjectedY = (x: number) => {
         if (x <= pStartX) return pStartY;
         if (x >= pEndX) return pEndY;
         const slope = (pEndY - pStartY) / (pEndX - pStartX);
         return pStartY + slope * (x - pStartX);
      };

      const upperLine = actualPoints.map(p => `${p[0]} ${p[1]}`).join(' L ');
      const lowerLine = [...actualPoints].reverse().map(p => `${p[0]} ${getProjectedY(p[0])}`).join(' L ');
      variancePolygonD = `M ${upperLine} L ${lowerLine} Z`;
    }

    const labelsX = [
      { x: mapX(firstShiftStart), label: format(firstShiftStart, 'HH:mm') },
      { x: mapX(new Date(firstShiftStart.getTime() + totalDurationMs / 2)), label: format(new Date(firstShiftStart.getTime() + totalDurationMs / 2), 'HH:mm') },
      { x: mapX(xMaxTime), label: format(xMaxTime, 'HH:mm') }
    ];

    const labelsY = [
      { y: mapY(yMax), label: Math.round(yMax).toString() },
      { y: mapY(yMax / 2), label: Math.round(yMax / 2).toString() },
      { y: mapY(0), label: '0' }
    ];

    const etaX = etaDate ? mapX(etaDate) : null;
    const etaY = etaDate ? mapY(target) : null;

    return { projectedPathD, actualPathD, variancePolygonD, labelsX, labelsY, etaX, etaY, actualPoints };
  }, [logs, shiftSchedule.value, target, time, etaDate]);

  const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div class="bg-background text-on-background font-body-lg overflow-hidden h-screen flex w-full">
      <Sidebar />
      <div class={`flex-1 ${isSidebarOpen.value ? 'ml-64' : 'ml-[80px]'} transition-all duration-300 flex flex-col h-screen overflow-hidden w-full`}>
        <TopAppBar title="Warehouse Operations" activeTab="Operational" />

        <main class="flex-1 p-gutter overflow-y-auto custom-scrollbar bg-surface-container-low w-full">
          <div class="max-w-[1600px] mx-auto grid grid-cols-12 gap-stack-md grid-rows-[auto_1fr]">
            
            {/* ROW 1: CRITICAL ALERTS & TIME */}
            <section class="col-span-12 lg:col-span-8 flex flex-col gap-stack-sm">
              {wirStatus === 'Critical Imbalance' ? (
                <div class="bg-error text-white px-6 py-4 flex items-center justify-between animate-alert rounded-sm shadow-sm">
                  <div class="flex items-center gap-4">
                    <span class="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                    <div>
                      <h3 class="font-headline-md text-headline-md uppercase tracking-widest m-0 p-0">ROUTING ALERT: YARD IMBALANCE</h3>
                      <p class="font-label-caps text-label-caps m-0 p-0">DIRECT TRUCKS TO {left < right ? 'LEFT' : 'RIGHT'} WING DOORS.</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-data-display text-[48px] leading-none">{(wir * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ) : (
                <div class="bg-secondary text-white px-6 py-4 flex items-center justify-between rounded-sm shadow-sm">
                  <div class="flex items-center gap-4">
                    <span class="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                    <div>
                      <h3 class="font-headline-md text-headline-md uppercase tracking-widest m-0 p-0">YARD BALANCED</h3>
                      <p class="font-label-caps text-label-caps m-0 p-0">OPERATIONS NORMAL</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-data-display text-[48px] leading-none">{(wir * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </section>

            <section class="col-span-12 lg:col-span-4 bg-primary text-white p-6 rounded shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
              <div class="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
              <p class="font-label-caps text-label-caps opacity-60 mb-2 m-0 p-0">CURRENT SITE TIME (UTC-5)</p>
              <h2 class="font-data-display text-[64px] tracking-tight leading-none tabular-nums m-0 p-0">{formatTime(time)}</h2>
              <p class="font-label-caps text-label-caps mt-2 opacity-60 m-0 p-0">FRIDAY, OCT 24, 2024</p>
            </section>

            {/* ROW 1.5: PERFORMANCE & MOMENTUM */}
            <section class="col-span-12 grid grid-cols-12 gap-stack-md">
              {/* Graph */}
              <div class="col-span-12 lg:col-span-8 bg-white border border-outline-variant p-6 rounded shadow-sm flex flex-col gap-4">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-4">
                    <h3 class="font-headline-md text-headline-md text-on-surface m-0 p-0">Unloading Rhythm</h3>
                    <div class="flex items-center gap-2 bg-secondary-container px-3 py-1 rounded-full text-on-secondary-container animate-pulse">
                      <span class="material-symbols-outlined text-sm" style={{fontVariationSettings: "'wght' 700"}}>keyboard_double_arrow_up</span>
                      <span class="font-label-caps text-[12px] font-bold">ACCELERATING +63%</span>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-0.5 border-t-2 border-dashed border-outline"></div>
                      <span class="text-[12px] font-label-caps text-on-surface-variant uppercase">Projected</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 bg-secondary rounded-sm"></div>
                      <span class="text-[12px] font-label-caps text-on-surface-variant uppercase">Actual</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 bg-error opacity-30 rounded-sm"></div>
                      <span class="text-[12px] font-label-caps text-error uppercase">Variance</span>
                    </div>
                  </div>
                </div>
                
                <div class="relative h-48 w-full flex items-end gap-1 border-l-2 border-b-2 border-outline-variant pb-2 pl-2 mt-4">
                  {graphData ? (
                    <>
                      <div class="absolute left-[-30px] top-0 h-full flex flex-col justify-between text-[10px] font-label-caps text-outline">
                        <span>{graphData.labelsY[0].label}</span>
                        <span>{graphData.labelsY[1].label}</span>
                        <span>{graphData.labelsY[2].label}</span>
                      </div>
                      <div class="absolute bottom-[-24px] left-0 w-full flex justify-between text-[10px] font-label-caps text-outline">
                        <span>{graphData.labelsX[0].label}</span>
                        <span>{graphData.labelsX[1].label}</span>
                        <span>{graphData.labelsX[2].label}</span>
                      </div>
                      <svg class="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {/* Background Grid Lines */}
                        <line stroke="#c6c6cd" stroke-dasharray="2" stroke-width="0.5" x1="0" x2="0" y1="0" y2="100"></line>
                        <line stroke="#c6c6cd" stroke-dasharray="2" stroke-width="0.5" x1="50" x2="50" y1="0" y2="100"></line>
                        <line stroke="#c6c6cd" stroke-dasharray="2" stroke-width="0.5" x1="100" x2="100" y1="0" y2="100"></line>
                        
                        {/* Variance Fill */}
                        <path d={graphData.variancePolygonD} fill="#ba1a1a" fill-opacity="0.15"></path>
                        
                        {/* Actual Progress Fill (Blue Shading) */}
                        <path d={`${graphData.actualPathD} L ${graphData.actualPoints[graphData.actualPoints.length-1]?.[0] || 0} 100 L ${graphData.actualPoints[0]?.[0] || 0} 100 Z`} fill="#0051d5" fill-opacity="0.05"></path>
                        
                        {/* Projected Path */}
                        <path d={graphData.projectedPathD} fill="none" stroke="#76777d" stroke-dasharray="4" stroke-width="2"></path>
                        
                        {/* Actual Path */}
                        <path d={graphData.actualPathD} fill="none" stroke="#0051d5" stroke-width="3"></path>
                        
                        {/* Current Time Dot */}
                        {graphData.actualPoints.length > 0 && (
                          <circle cx={graphData.actualPoints[graphData.actualPoints.length-1][0]} cy={graphData.actualPoints[graphData.actualPoints.length-1][1]} fill="#0051d5" r="2"></circle>
                        )}
                        
                        {/* ETA Marker */}
                        {graphData.etaX !== null && graphData.etaY !== null && (
                          <>
                            <circle cx={graphData.etaX} cy={graphData.etaY} fill="#0051d5" r="2"></circle>
                            <line stroke="#0051d5" stroke-dasharray="4 2" stroke-width="1.5" x1={graphData.etaX} x2={graphData.etaX} y1="0" y2="100"></line>
                            <text fill="#0051d5" font-family="JetBrains Mono" font-size="4" font-weight="bold" x={Math.max(0, graphData.etaX - 15)} y={Math.max(4, graphData.etaY - 4)}>ETA</text>
                          </>
                        )}
                      </svg>
                    </>
                  ) : (
                    <div class="w-full h-full flex items-center justify-center text-outline">No Schedule Data</div>
                  )}
                </div>
                <div class="pt-4 text-right flex justify-end gap-6">
                  <span class="text-[12px] font-data-display text-secondary uppercase">* Weighted by Recency</span>
                  <span class="text-[12px] font-data-display text-outline uppercase">Units: U/HR | Time: 4H Window</span>
                </div>
              </div>

              {/* Stats Column (Right Side) */}
              <div class="col-span-12 lg:col-span-4 flex flex-col gap-stack-md">
                
                {/* Shift Progress */}
                <div class="bg-white border border-outline-variant p-6 rounded shadow-sm">
                  <h3 class="font-headline-md text-headline-md mb-6 m-0 p-0">Shift Progress</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                      <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">COMPLETED</p>
                      <p class="font-data-display text-[42px] leading-none text-secondary m-0 p-0">{completed}</p>
                    </div>
                    <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                      <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">REMAINING</p>
                      <p class="font-data-display text-[42px] leading-none m-0 p-0">{Math.max(0, target - completed)}</p>
                    </div>
                    <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                      <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">LEFT LOAD</p>
                      <p class="font-data-display text-[42px] leading-none m-0 p-0">{left}</p>
                    </div>
                    <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                      <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">RIGHT LOAD</p>
                      <p class="font-data-display text-[42px] leading-none m-0 p-0">{right}</p>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-white border border-outline-variant p-4 rounded shadow-sm flex flex-col justify-between">
                    <span class="font-label-caps text-on-surface-variant text-[10px] uppercase">Avg Rate</span>
                    <div class="mt-2">
                      <span class="font-data-display text-4xl text-primary">{currentVelocity.toFixed(1)}</span>
                      <span class="block font-label-caps text-[10px] font-bold opacity-70 uppercase">TRK/HR</span>
                    </div>
                  </div>
                  <div class="bg-white border border-outline-variant p-4 rounded shadow-sm flex flex-col justify-between">
                    <span class="font-label-caps text-on-surface-variant text-[10px] uppercase">Target Rate</span>
                    <div class="mt-2">
                      <span class="font-data-display text-4xl text-primary">{historicalAnchor.value.toFixed(1)}</span>
                      <span class="block font-label-caps text-[10px] font-bold opacity-70 uppercase">T/HR</span>
                    </div>
                  </div>
                  <div class="bg-white border border-outline-variant p-4 rounded shadow-sm flex flex-col justify-between">
                    <span class="font-label-caps text-on-surface-variant text-[10px] uppercase">Est. Finish</span>
                    <div class="mt-2">
                      <span class="font-data-display text-4xl text-primary">{etaDate ? format(etaDate, 'HH:mm') : '--:--'}</span>
                      <span class="block font-label-caps text-[10px] font-bold opacity-70 uppercase">HRS</span>
                    </div>
                  </div>
                  <div class="bg-white border border-outline-variant p-4 rounded shadow-sm flex flex-col justify-between">
                    <span class="font-label-caps text-on-surface-variant text-[10px] uppercase">Time Rem.</span>
                    <div class="mt-2">
                      <span class="font-data-display text-4xl text-primary">{timeRem}</span>
                      <span class="block font-label-caps text-[10px] font-bold opacity-70 uppercase">MIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ROW 2: BAYS STATUS & TRUCK PROGRESS */}
            <section class="col-span-12 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
              
              {/* Left Wing Bays */}
              {[79, 78, 77, 76].map(bay => {
                const bayLogs = logs.filter(l => l.bay === String(bay));
                const total = bayLogs.length;
                return (
                  <div key={bay} class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">LEFT WING</p>
                        <h4 class="font-headline-md text-headline-md m-0 p-0">BAY {bay}</h4>
                      </div>
                      <span class="bg-outline-variant bg-opacity-20 text-on-surface-variant px-2 py-1 font-label-caps text-[10px] rounded">UNLOADING</span>
                    </div>
                    <div class="flex-1 py-4 flex items-center justify-center bg-surface-container-low rounded">
                      <div class="text-center">
                        <span class="font-data-display text-4xl text-primary">{total}</span>
                        <span class="block font-label-caps text-[10px] opacity-60">TRUCKS</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Right Wing Bays */}
              {[72, 71, 70, 69, 68].map(bay => {
                const isLoading = bay === 70;
                const bayLogs = logs.filter(l => l.bay === String(bay));
                const total = bayLogs.length;
                
                return (
                  <div key={bay} class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">RIGHT WING</p>
                        <h4 class="font-headline-md text-headline-md m-0 p-0">BAY {bay}</h4>
                      </div>
                      {isLoading ? (
                        <span class="bg-tertiary-container text-on-tertiary-container px-2 py-1 font-label-caps text-[10px] rounded">LOADING</span>
                      ) : (
                        <span class="bg-outline-variant bg-opacity-20 text-on-surface-variant px-2 py-1 font-label-caps text-[10px] rounded">UNLOADING</span>
                      )}
                    </div>
                    <div class="flex-1 py-4 flex items-center justify-center bg-surface-container-low rounded">
                      <div class="text-center">
                        {isLoading ? (
                          <span class="material-symbols-outlined text-outline-variant text-4xl">output</span>
                        ) : (
                          <>
                            <span class="font-data-display text-4xl text-primary">{total}</span>
                            <span class="block font-label-caps text-[10px] opacity-60">TRUCKS</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Progress Bars for Schedule Windows */}
            <section class="col-span-12 xl:col-span-3 flex flex-col gap-stack-md">
              <div class="bg-white border border-outline-variant p-6 rounded shadow-sm h-full flex flex-col">
                <div class="flex items-center gap-2 mb-6">
                  <span class="material-symbols-outlined text-secondary">schedule</span>
                  <h3 class="font-headline-md text-headline-md m-0 p-0">Truck Windows</h3>
                </div>
                <div class="flex-1 space-y-8 flex flex-col gap-6">
                  {truckWindows.map((window, i) => (
                    <div class={`space-y-3 ${window.state === 'future' ? 'opacity-40' : window.state === 'past' ? 'opacity-60' : ''}`} key={i}>
                      <div class="flex justify-between items-end">
                        <span class="font-data-display text-data-display">{window.startStr}</span>
                        <span class="font-label-caps text-label-caps text-on-surface-variant">{window.count}/{window.target} TRUCKS</span>
                      </div>
                      <div class="w-full bg-surface-container-highest h-4 rounded-full overflow-hidden">
                        <div class={`h-full ${window.state === 'future' ? 'bg-outline-variant' : 'bg-secondary'} transition-all`} style={{width: `${window.progress}%`}}></div>
                      </div>
                      {window.state === 'active' && <p class="font-label-caps text-[10px] text-right text-secondary font-bold m-0 p-0">IN PROGRESS</p>}
                      {window.state === 'past' && <p class="font-label-caps text-[10px] text-right m-0 p-0">COMPLETED</p>}
                    </div>
                  ))}
                </div>
                <div class="mt-auto pt-6 border-t border-outline-variant">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-label-caps text-label-caps">SITE EFFICIENCY</span>
                    <span class="font-headline-md text-headline-md text-secondary">94.2%</span>
                  </div>
                  <div class="w-full h-1 bg-secondary bg-opacity-20">
                    <div class="w-[94.2%] h-full bg-secondary"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* ROW 3: LIVE FEED & DATA MAP */}
            <section class="col-span-12 bg-white border border-outline-variant p-4 rounded shadow-sm flex flex-col gap-4 mb-8">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary">videocam</span>
                  <h3 class="font-headline-md text-headline-md m-0 p-0">Live Yard Feed</h3>
                </div>
                <div class="flex gap-2 items-center">
                  <span class="w-3 h-3 rounded-full bg-secondary animate-pulse"></span>
                  <span class="font-label-caps text-label-caps text-secondary">LIVE</span>
                </div>
              </div>
              <div class="aspect-[21/9] w-full bg-black relative rounded overflow-hidden group">
                <img class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNxE0n1CZfEQiTGfItFUKdNTSoE0EB_1DYqaiTxb5AP3p38RYP--UgilpH71R9m0Mw3t07Bv7xjp299-OewY05ZGCDRnHrFwqsk3tzJzNLePZ2okyGb2yM4KbRwEZGx_AJAqA3_jjmcjuaEKXNeJDlSCGidAU7Acs5-OPY0fGX_gUEV4FN8GVNQV8RO4YgHBHTF0cN6g_csBEm0zZNDxcvLh2vIj07scWnqIY1UAVRBxd5NMvWOH54BwrE_a93ChSQkjPRn2IHUWo"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded font-label-caps text-[10px] text-white">
                  CAMERA 04 - GATE WEST 2
                </div>
                <div class="absolute border-2 border-secondary top-[40%] left-[30%] w-32 h-20 flex flex-col justify-end p-2">
                  <div class="bg-secondary text-white text-[8px] font-label-caps px-1">ID: T-242 - CONFIRMED</div>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
