import { useState } from 'preact/hooks';
import { activeTeams, addTruck } from '../store';

export function TabletInput() {
  const [selectedWing, setSelectedWing] = useState<'Left' | 'Right' | null>(null);

  const handleWingSelect = (wing: 'Left' | 'Right') => {
    setSelectedWing(wing);
  };

  const handleTypeSelect = (type: 'Pallet' | 'Floor') => {
    if (selectedWing) {
      addTruck(selectedWing, type);
      setSelectedWing(null);
    }
  };

  const activeCount = activeTeams.value;

  return (
    <div class="bg-[#121212] text-white min-h-screen flex flex-col font-body-lg w-full select-none overflow-hidden touch-manipulation">
      {/* Header */}
      <header class="w-full h-16 bg-[#1e1e1e] border-b border-[#333] flex justify-between items-center px-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-secondary text-3xl">tablet_mac</span>
          <h1 class="font-headline-md text-headline-md font-bold text-white tracking-widest uppercase m-0 p-0">Dock Entry</h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-label-caps text-label-caps text-[#888]">STATUS: ONLINE</span>
          <div class="bg-secondary-container text-on-secondary-container px-4 py-2 rounded font-bold font-data-display text-xl">
            {activeCount} {activeCount === 1 ? 'TEAM' : 'TEAMS'} ACTIVE
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="flex-1 flex w-full relative">
        {/* Left Wing Button */}
        <button 
          onClick={() => handleWingSelect('Left')}
          class="flex-1 flex flex-col items-center justify-center bg-[#1a233a] hover:bg-[#232e4d] active:bg-[#2d3a5e] border-r border-[#333] transition-colors focus:outline-none"
        >
          <span class="material-symbols-outlined text-[120px] text-secondary mb-6">turn_left</span>
          <span class="font-headline-lg text-[48px] font-bold tracking-widest">LEFT WING</span>
        </button>

        {/* Right Wing Button */}
        <button 
          onClick={() => handleWingSelect('Right')}
          class="flex-1 flex flex-col items-center justify-center bg-[#3a1a1a] hover:bg-[#4d2323] active:bg-[#5e2d2d] transition-colors focus:outline-none"
        >
          <span class="material-symbols-outlined text-[120px] text-error mb-6">turn_right</span>
          <span class="font-headline-lg text-[48px] font-bold tracking-widest">RIGHT WING</span>
        </button>

        {/* Modal Overlay */}
        {selectedWing && (
          <div class="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col p-6 animate-fade-in">
            <header class="flex justify-between items-center mb-6">
              <h2 class="font-headline-lg text-[36px] font-bold text-white uppercase">
                {selectedWing} Wing Payload
              </h2>
              <button 
                onClick={() => setSelectedWing(null)}
                class="bg-[#333] hover:bg-[#444] rounded-full w-16 h-16 flex items-center justify-center text-white"
              >
                <span class="material-symbols-outlined text-4xl">close</span>
              </button>
            </header>
            
            <div class="flex-1 flex gap-6">
              <button 
                onClick={() => handleTypeSelect('Pallet')}
                class="flex-1 bg-[#1a3a24] hover:bg-[#234d31] active:bg-[#2d5e3c] rounded-2xl flex flex-col items-center justify-center border-4 border-[#3a6e4d] transition-all"
              >
                <span class="material-symbols-outlined text-[120px] text-[#4ade80] mb-6">inventory_2</span>
                <span class="font-headline-lg text-[56px] font-bold">PALLETIZED</span>
                <span class="text-xl text-[#888] font-mono mt-4">QUICK UNLOAD</span>
              </button>

              <button 
                onClick={() => handleTypeSelect('Floor')}
                class="flex-1 bg-[#3a281a] hover:bg-[#4d3623] active:bg-[#5e432d] rounded-2xl flex flex-col items-center justify-center border-4 border-[#6e4e3a] transition-all"
              >
                <span class="material-symbols-outlined text-[120px] text-[#fb923c] mb-6">view_column_2</span>
                <span class="font-headline-lg text-[56px] font-bold">FLOOR-LOAD</span>
                <span class="text-xl text-[#888] font-mono mt-4">MANUAL UNLOAD</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
