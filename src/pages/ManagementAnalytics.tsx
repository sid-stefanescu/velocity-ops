import { Sidebar } from '../components/Sidebar'
import { TopAppBar } from '../components/TopAppBar'

export function ManagementAnalytics() {
  return (
    <div class="bg-background text-on-background font-body-lg overflow-hidden h-screen flex w-full">
      <Sidebar />
      <div class="flex-1 ml-64 flex flex-col h-screen overflow-hidden w-full">
        <TopAppBar title="Management Insights" activeTab="Strategic" showSearch={true} />

        <main class="flex-1 p-gutter overflow-y-auto bg-background custom-scrollbar w-full">
          {/* Alert Banner */}
          <div class="mb-gutter bg-error flex items-center justify-between px-6 py-3 rounded shadow-sm">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
              <span class="font-label-caps text-label-caps text-white font-bold uppercase">URGENT: Bay 14 Bottleneck detected - Throughput down 24%</span>
            </div>
            <button class="text-white font-label-caps text-label-caps border border-white border-opacity-30 px-3 py-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors bg-transparent cursor-pointer">
              View Incident
            </button>
          </div>

          {/* Page Header & Filters */}
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="font-headline-lg text-headline-lg text-primary m-0 p-0">Management Insights</h2>
              <p class="font-body-lg text-body-lg text-on-surface-variant m-0 p-0 mt-1">Strategic performance analysis for WH-042</p>
            </div>
            <div class="flex gap-3">
              <div class="bg-white border border-outline-variant p-1 rounded flex">
                <button class="px-4 py-1.5 rounded bg-surface-container font-label-caps text-label-caps text-secondary border-none cursor-pointer">24H</button>
                <button class="px-4 py-1.5 rounded font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-low border-none bg-transparent cursor-pointer">7D</button>
                <button class="px-4 py-1.5 rounded font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-low border-none bg-transparent cursor-pointer">30D</button>
              </div>
              <button class="bg-white border border-outline-variant px-4 py-2 rounded font-label-caps text-label-caps flex items-center gap-2 hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface">
                <span class="material-symbols-outlined text-[18px]">filter_list</span>
                All Areas
              </button>
              <button class="bg-secondary text-white px-4 py-2 rounded font-label-caps text-label-caps flex items-center gap-2 active:scale-95 transition-transform border-none cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* Dashboard Bento Grid */}
          <div class="grid grid-cols-12 gap-stack-md">
            {/* KPI Card 1 */}
            <div class="col-span-12 md:col-span-3 bg-white border border-outline-variant p-stack-md flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-2">
                  <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Daily Throughput</span>
                  <span class="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded">+12.4%</span>
                </div>
                <div class="font-data-display text-data-display text-primary">14,204 <span class="text-body-sm font-normal text-on-surface-variant">units</span></div>
              </div>
              <div class="mt-4 h-12 flex items-end gap-1">
                <div class="flex-1 bg-secondary bg-opacity-20 h-3/4"></div>
                <div class="flex-1 bg-secondary bg-opacity-20 h-1/2"></div>
                <div class="flex-1 bg-secondary bg-opacity-20 h-2/3"></div>
                <div class="flex-1 bg-secondary bg-opacity-20 h-4/5"></div>
                <div class="flex-1 bg-secondary bg-opacity-40 h-full"></div>
                <div class="flex-1 bg-secondary h-2/3"></div>
              </div>
            </div>

            {/* KPI Card 2 */}
            <div class="col-span-12 md:col-span-3 bg-white border border-outline-variant p-stack-md flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-2">
                  <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Labor Cost Ratio</span>
                  <span class="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">-2.1%</span>
                </div>
                <div class="font-data-display text-data-display text-primary">$0.42 <span class="text-body-sm font-normal text-on-surface-variant">per unit</span></div>
              </div>
              <div class="mt-4 h-12 flex items-center">
                <div class="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div class="bg-error h-full" style={{width: '82%'}}></div>
                </div>
              </div>
            </div>

            {/* KPI Card 3 */}
            <div class="col-span-12 md:col-span-3 bg-white border border-outline-variant p-stack-md flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-2">
                  <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Avg Dock Time</span>
                  <span class="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded">-14m</span>
                </div>
                <div class="font-data-display text-data-display text-primary">42 <span class="text-body-sm font-normal text-on-surface-variant">minutes</span></div>
              </div>
              <div class="mt-4 flex gap-4">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full bg-secondary"></div>
                  <span class="text-[10px] font-label-caps text-on-surface-variant">TARGET: 45m</span>
                </div>
              </div>
            </div>

            {/* KPI Card 4 */}
            <div class="col-span-12 md:col-span-3 bg-white border border-outline-variant p-stack-md flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-2">
                  <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Fleet Utilization</span>
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-on-surface-variant">STABLE</span>
                </div>
                <div class="font-data-display text-data-display text-primary">94.8%</div>
              </div>
              <div class="mt-4 h-12 flex items-center justify-between">
                <div class="flex -space-x-2">
                  <div class="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                  <div class="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                  <div class="w-8 h-8 rounded-full border-2 border-white bg-slate-400"></div>
                  <div class="w-8 h-8 rounded-full border-2 border-white bg-secondary text-white text-[10px] flex items-center justify-center font-bold">+12</div>
                </div>
                <span class="text-[10px] font-label-caps text-secondary font-bold">ACTIVE FORK-LIFTS</span>
              </div>
            </div>

            {/* Primary Chart: Throughput Trends */}
            <div class="col-span-12 md:col-span-8 bg-white border border-outline-variant p-stack-md">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-label-caps text-label-caps text-primary uppercase m-0 p-0">Throughput vs. Labor Allocation</h3>
                <div class="flex gap-4">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-secondary"></div>
                    <span class="text-[11px] font-label-caps text-on-surface-variant">Units Processed</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 border-2 border-primary border-opacity-20"></div>
                    <span class="text-[11px] font-label-caps text-on-surface-variant">Labor Hours</span>
                  </div>
                </div>
              </div>
              <div class="h-64 grid-lines relative border-l border-b border-outline-variant">
                <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <path d="M0,150 L100,140 L200,160 L300,130 L400,110 L500,145 L600,120 L700,90 L800,100" fill="none" stroke="#0051d5" stroke-width="3" vector-effect="non-scaling-stroke"></path>
                  <path d="M0,150 L100,140 L200,160 L300,130 L400,110 L500,145 L600,120 L700,90 L800,100 L800,256 L0,256 Z" fill="url(#grad1)" opacity="0.1"></path>
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#0051d5', stopOpacity: 1}}></stop>
                      <stop offset="100%" style={{stopColor: '#0051d5', stopOpacity: 0}}></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute bottom-0 left-0 w-full flex justify-between px-2 pt-2 text-[10px] font-label-caps text-on-surface-variant">
                  <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
                </div>
              </div>
            </div>

            {/* Efficiency Rating List */}
            <div class="col-span-12 md:col-span-4 bg-white border border-outline-variant p-stack-md flex flex-col">
              <h3 class="font-label-caps text-label-caps text-primary uppercase mb-6 m-0 p-0">Bay Efficiency Ratings</h3>
              <div class="space-y-4 flex-1 flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-surface-container flex items-center justify-center font-bold text-primary font-data-display">A1</div>
                    <div>
                      <div class="font-body-lg text-body-lg font-bold">North Dock</div>
                      <div class="text-[10px] font-label-caps text-on-surface-variant">98.2% EFFICIENCY</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-secondary font-bold text-sm">OPTIMAL</div>
                    <div class="w-16 h-1.5 bg-surface-container rounded-full mt-1">
                      <div class="bg-[#146c2e] h-full w-full rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-surface-container flex items-center justify-center font-bold text-primary font-data-display">B4</div>
                    <div>
                      <div class="font-body-lg text-body-lg font-bold">Cold Storage</div>
                      <div class="text-[10px] font-label-caps text-on-surface-variant">84.5% EFFICIENCY</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-primary font-bold text-sm">NOMINAL</div>
                    <div class="w-16 h-1.5 bg-surface-container rounded-full mt-1">
                      <div class="bg-secondary h-full rounded-full" style={{width: '84%'}}></div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-surface-container flex items-center justify-center font-bold text-primary font-data-display">C2</div>
                    <div>
                      <div class="font-body-lg text-body-lg font-bold">Hazmat Bay</div>
                      <div class="text-[10px] font-label-caps text-on-surface-variant">62.1% EFFICIENCY</div>
                    </div>
                  </div>
                  <div class="text-right text-error">
                    <div class="font-bold text-sm">CRITICAL</div>
                    <div class="w-16 h-1.5 bg-surface-container rounded-full mt-1">
                      <div class="bg-error h-full rounded-full" style={{width: '62%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              <button class="mt-6 w-full bg-transparent border border-outline-variant py-2 font-label-caps text-label-caps hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface">Analyze All Bays</button>
            </div>

            {/* Detailed Table: Truck Offloading Trend */}
            <div class="col-span-12 bg-white border border-outline-variant mb-8">
              <div class="px-stack-md py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 class="font-label-caps text-label-caps text-primary uppercase m-0 p-0">Recent Truck Offloading Metrics</h3>
                <button class="text-secondary bg-transparent border-none font-label-caps text-label-caps flex items-center gap-1 cursor-pointer">
                  Full Log <span class="material-symbols-outlined text-sm">open_in_new</span>
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead class="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th class="px-stack-md py-3 font-label-caps text-label-caps text-on-surface-variant">TRUCK ID</th>
                      <th class="px-stack-md py-3 font-label-caps text-label-caps text-on-surface-variant">CARRIER</th>
                      <th class="px-stack-md py-3 font-label-caps text-label-caps text-on-surface-variant">PALLETS</th>
                      <th class="px-stack-md py-3 font-label-caps text-label-caps text-on-surface-variant">DUR. (MIN)</th>
                      <th class="px-stack-md py-3 font-label-caps text-label-caps text-on-surface-variant">STAFF</th>
                      <th class="px-stack-md py-3 font-label-caps text-label-caps text-on-surface-variant">STATUS</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant font-body-sm">
                    <tr class="hover:bg-surface-container-low transition-colors">
                      <td class="px-stack-md py-4 font-label-caps text-primary">#WH-TR-2910</td>
                      <td class="px-stack-md py-4">Global Logistics Co.</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">28</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">34</td>
                      <td class="px-stack-md py-4">
                        <span class="bg-surface-container px-2 py-1 rounded text-[11px] font-bold">4 OP</span>
                      </td>
                      <td class="px-stack-md py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333]">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#137333]"></span> COMPLETED
                        </span>
                      </td>
                    </tr>
                    <tr class="hover:bg-surface-container-low transition-colors">
                      <td class="px-stack-md py-4 font-label-caps text-primary">#WH-TR-2911</td>
                      <td class="px-stack-md py-4">Swift Freight Ltd</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">14</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">18</td>
                      <td class="px-stack-md py-4">
                        <span class="bg-surface-container px-2 py-1 rounded text-[11px] font-bold">2 OP</span>
                      </td>
                      <td class="px-stack-md py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333]">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#137333]"></span> COMPLETED
                        </span>
                      </td>
                    </tr>
                    <tr class="hover:bg-surface-container-low transition-colors">
                      <td class="px-stack-md py-4 font-label-caps text-primary">#WH-TR-2912</td>
                      <td class="px-stack-md py-4">North Star Cargo</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">32</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">--</td>
                      <td class="px-stack-md py-4">
                        <span class="bg-surface-container px-2 py-1 rounded text-[11px] font-bold">5 OP</span>
                      </td>
                      <td class="px-stack-md py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-secondary">
                          <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> IN PROGRESS
                        </span>
                      </td>
                    </tr>
                    <tr class="hover:bg-surface-container-low transition-colors">
                      <td class="px-stack-md py-4 font-label-caps text-primary">#WH-TR-2913</td>
                      <td class="px-stack-md py-4">Ocean-Wide Express</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">12</td>
                      <td class="px-stack-md py-4 font-data-display text-sm">45</td>
                      <td class="px-stack-md py-4">
                        <span class="bg-surface-container px-2 py-1 rounded text-[11px] font-bold">2 OP</span>
                      </td>
                      <td class="px-stack-md py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-error-container text-error">
                          <span class="w-1.5 h-1.5 rounded-full bg-error"></span> DELAYED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
