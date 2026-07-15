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
  const left = leftWingCount.value;
  const right = rightWingCount.value;
  
  const currentVelocity = useMemo(() => 
    calculateSmoothedVelocity(logs, shiftSchedule.value, historicalAnchor.value, waveWeights.value, time), 
  [logs, shiftSchedule.value, historicalAnchor.value, waveWeights.value, time]);

  const eta = useMemo(() => 
    projectETA(targetTrucks.value - trucksCompleted.value, currentVelocity, shiftSchedule.value, time), 
  [targetTrucks.value, trucksCompleted.value, currentVelocity, shiftSchedule.value, time]);

  const { wir, status: wirStatus } = useMemo(() => calculateWIR(left, right, wirThresholds.value), [left, right, wirThresholds.value]);
  
  const timeRem = eta ? Math.max(0, differenceInMinutes(eta, time)) : 0;

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
              {/* KPIs */}
              <div class="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
                <div class="bg-white border border-outline-variant p-4 rounded shadow-sm flex flex-col justify-between">
                  <span class="font-label-caps text-on-surface-variant text-[10px] uppercase">Avg Unload Rate</span>
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
                  <div class="absolute left-[-30px] top-0 h-full flex flex-col justify-between text-[10px] font-label-caps text-outline">
                    <span>60</span>
                    <span>30</span>
                    <span>0</span>
                  </div>
                  <div class="absolute bottom-[-24px] left-0 w-full flex justify-between text-[10px] font-label-caps text-outline">
                    <span>08:00</span>
                    <span>15:00</span>
                    <span>22:00</span>
                  </div>
                  <svg class="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M 0 80 L 20 70 L 40 75 L 60 60 L 80 45 L 92 35 L 92 15 L 80 25 L 60 55 L 40 65 L 20 75 L 0 85 Z" fill="#ba1a1a" fill-opacity="0.25"></path>
                    <line stroke="#c6c6cd" stroke-dasharray="2" stroke-width="0.5" x1="0" x2="0" y1="0" y2="100"></line>
                    <line stroke="#c6c6cd" stroke-dasharray="2" stroke-width="0.5" x1="50" x2="50" y1="0" y2="100"></line>
                    <line stroke="#c6c6cd" stroke-dasharray="2" stroke-width="0.5" x1="100" x2="100" y1="0" y2="100"></line>
                    <path d="M 0 85 L 20 75 L 40 65 L 60 55 L 80 25 L 92 15 L 92 100 L 0 100 Z" fill="#0051d5" fill-opacity="0.1"></path>
                    <path d="M 0 80 L 20 70 L 40 75 L 60 60 L 80 45 L 100 30" fill="none" stroke="#76777d" stroke-dasharray="4" stroke-width="2"></path>
                    <path d="M 0 85 L 20 75 L 40 65 L 60 55 L 80 25 L 92 15" fill="none" stroke="#0051d5" stroke-width="3"></path>
                    <circle cx="0" cy="85" fill="#0051d5" r="2"></circle>
                    <circle cx="20" cy="75" fill="#0051d5" r="2"></circle>
                    <circle cx="40" cy="65" fill="#0051d5" r="2"></circle>
                    <circle cx="60" cy="55" fill="#0051d5" r="2"></circle>
                    <circle cx="80" cy="25" fill="#0051d5" r="2"></circle>
                    <circle cx="92" cy="15" fill="#0051d5" r="2"></circle>
                    <line stroke="#0051d5" stroke-dasharray="4 2" stroke-width="2" x1="92" x2="92" y1="0" y2="100"></line>
                    <text fill="#0051d5" font-family="JetBrains Mono" font-size="4" font-weight="bold" x="65" y="8">EST. FINISH</text>
                  </svg>
                </div>
                <div class="pt-4 text-right flex justify-end gap-6">
                  <span class="text-[12px] font-data-display text-secondary uppercase">* Weighted by Recency</span>
                  <span class="text-[12px] font-data-display text-outline uppercase">Units: U/HR | Time: 4H Window</span>
                </div>
              </div>
            </section>

            {/* ROW 2: BAYS STATUS & TRUCK PROGRESS */}
            <section class="col-span-12 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
              {/* Bay 1 */}
              <div class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden group">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 01</p>
                    <h4 class="font-headline-md text-headline-md m-0 p-0">LOAD_A4</h4>
                  </div>
                  <span class="bg-secondary-container text-on-secondary-container px-2 py-1 font-label-caps text-[10px] rounded">ACTIVE</span>
                </div>
                <div class="flex-1 py-4">
                  <div class="h-24 w-full bg-surface-container-low rounded relative">
                    <div class="absolute inset-0 bg-secondary/5 flex items-center justify-center">
                      <span class="material-symbols-outlined text-secondary text-opacity-30 text-5xl">local_shipping</span>
                    </div>
                    <div class="absolute bottom-0 left-0 h-1 bg-secondary transition-all duration-1000" style={{width: '72%'}}></div>
                  </div>
                </div>
                <div class="flex justify-between font-label-caps text-label-caps">
                  <span class="opacity-60">PROGRESS</span>
                  <span class="text-secondary font-bold">72%</span>
                </div>
              </div>

              {/* Bay 2 */}
              <div class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 02</p>
                    <h4 class="font-headline-md text-headline-md m-0 p-0">DOCK_B2</h4>
                  </div>
                  <span class="bg-error-container text-error px-2 py-1 font-label-caps text-[10px] rounded animate-pulse">DELAYED</span>
                </div>
                <div class="flex-1 py-4">
                  <div class="h-24 w-full bg-error-container bg-opacity-20 rounded flex items-center justify-center">
                    <span class="material-symbols-outlined text-error text-opacity-50 text-5xl">error_outline</span>
                  </div>
                </div>
                <div class="flex justify-between font-label-caps text-label-caps">
                  <span class="opacity-60">ETA OFFSET</span>
                  <span class="text-error font-bold">+18 MIN</span>
                </div>
              </div>

              {/* Bay 3 */}
              <div class="bg-surface-container-low border border-dashed border-outline-variant p-4 flex flex-col gap-4 shadow-none opacity-60">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 03</p>
                    <h4 class="font-headline-md text-headline-md m-0 p-0">EMPTY</h4>
                  </div>
                  <span class="bg-outline-variant bg-opacity-20 text-on-surface-variant px-2 py-1 font-label-caps text-[10px] rounded">IDLE</span>
                </div>
                <div class="flex-1 py-4 flex items-center justify-center">
                  <span class="material-symbols-outlined text-outline-variant text-4xl">check_circle</span>
                </div>
                <div class="flex justify-center font-label-caps text-label-caps">
                  <span class="opacity-40">WAITING ASSIGNMENT</span>
                </div>
              </div>

              {/* Bay 4 */}
              <div class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm relative">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 04</p>
                    <h4 class="font-headline-md text-headline-md m-0 p-0">EXP_C9</h4>
                  </div>
                  <span class="bg-secondary-container text-on-secondary-container px-2 py-1 font-label-caps text-[10px] rounded">ACTIVE</span>
                </div>
                <div class="flex-1 py-4">
                  <div class="h-24 w-full bg-surface-container-low rounded relative overflow-hidden">
                    <div class="absolute inset-0 bg-secondary/5 flex items-center justify-center">
                      <span class="material-symbols-outlined text-secondary text-opacity-30 text-5xl">conveyor_belt</span>
                    </div>
                    <div class="absolute bottom-0 left-0 h-1 bg-secondary" style={{width: '25%'}}></div>
                  </div>
                </div>
                <div class="flex justify-between font-label-caps text-label-caps">
                  <span class="opacity-60">OFFLOADING</span>
                  <span class="text-secondary font-bold">25%</span>
                </div>
              </div>

              {/* Row of 4 more bays simplified */}
              <div class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm">
                <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 05</p>
                <h4 class="font-headline-md text-headline-md m-0 p-0">READY</h4>
                <div class="h-1 bg-surface-container-highest w-full rounded-full mt-4"></div>
              </div>
              <div class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm">
                <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 06</p>
                <h4 class="font-headline-md text-headline-md m-0 p-0">INSP_1</h4>
                <div class="h-1 bg-secondary w-1/2 rounded-full mt-4"></div>
              </div>
              <div class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm">
                <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 07</p>
                <h4 class="font-headline-md text-headline-md m-0 p-0">LOAD_Z2</h4>
                <div class="h-1 bg-secondary w-full rounded-full mt-4"></div>
              </div>
              <div class="bg-white border border-outline-variant p-4 flex flex-col gap-4 shadow-sm">
                <p class="font-label-caps text-label-caps text-on-surface-variant m-0 p-0">BAY 08</p>
                <h4 class="font-headline-md text-headline-md m-0 p-0">MAINT</h4>
                <div class="h-1 bg-tertiary-container w-full rounded-full mt-4"></div>
              </div>
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
            <section class="col-span-12 lg:col-span-7 bg-white border border-outline-variant p-4 rounded shadow-sm flex flex-col gap-4 mb-8">
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
              <div class="aspect-video w-full bg-black relative rounded overflow-hidden group">
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

            <section class="col-span-12 lg:col-span-5 bg-white border border-outline-variant p-6 rounded shadow-sm mb-8">
              <h3 class="font-headline-md text-headline-md mb-6 m-0 p-0">Shift Progress</h3>
              <div class="grid grid-cols-2 gap-4 h-[calc(100%-40px)]">
                <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                  <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">COMPLETED TRUCKS</p>
                  <p class="font-data-display text-[42px] leading-none text-secondary m-0 p-0">{completed}</p>
                </div>
                <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                  <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">REMAINING</p>
                  <p class="font-data-display text-[42px] leading-none m-0 p-0">{Math.max(0, target - completed)}</p>
                </div>
                <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                  <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">LEFT WING LOAD</p>
                  <p class="font-data-display text-[42px] leading-none m-0 p-0">{left}</p>
                </div>
                <div class="bg-surface-container p-4 flex flex-col justify-center items-center gap-2">
                  <p class="font-label-caps text-label-caps opacity-60 m-0 p-0">RIGHT WING LOAD</p>
                  <p class="font-data-display text-[42px] leading-none m-0 p-0">{right}</p>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
