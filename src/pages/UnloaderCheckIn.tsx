import { useState } from 'preact/hooks'

export function UnloaderCheckIn() {
  const [selectedBay, setSelectedBay] = useState<string | null>(null)
  const [truckNumber, setTruckNumber] = useState('')
  const [unloaderId, setUnloaderId] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle')

  const bays = ['71', '72', '73', '74', '75', '76', '77', '78', '79']

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (!selectedBay || !truckNumber || !unloaderId) {
      alert("Please complete all fields.")
      return
    }

    setStatus('processing')
    
    setTimeout(() => {
      setStatus('success')
      
      setTimeout(() => {
        // Reset form
        setSelectedBay(null)
        setTruckNumber('')
        setUnloaderId('')
        setStatus('idle')
      }, 2000)
    }, 1000)
  }

  return (
    <div class="bg-surface text-on-surface min-h-screen flex flex-col font-body-lg w-full">
      <header class="w-full top-0 border-b border-outline-variant bg-surface flex justify-between items-center px-margin-mobile py-stack-sm sticky z-50">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>widgets</span>
          <h1 class="font-headline-md text-headline-md font-bold text-primary tracking-tight uppercase m-0 p-0">VELOCITY OPS</h1>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-sm border border-outline-variant">WH-402</span>
          <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center border border-outline-variant">
            <span class="material-symbols-outlined text-on-primary-fixed" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
          </div>
        </div>
      </header>

      <main class="flex-1 p-margin-mobile flex flex-col gap-stack-lg max-w-md mx-auto w-full pb-32">
        <div>
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase m-0">Unloader Check-in</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Select bay and enter incoming truck details.</p>
        </div>

        <form class="flex flex-col gap-stack-lg flex-1" id="checkin-form">
          <div class="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant">
            <label class="block font-label-caps text-label-caps text-on-surface mb-stack-md uppercase">1. Select Bay Number</label>
            <div class="grid grid-cols-3 gap-2">
              {bays.map((bay) => (
                <button
                  key={bay}
                  type="button"
                  class={`bay-btn h-14 rounded border flex items-center justify-center font-data-display text-data-display transition-colors ${
                    selectedBay === bay
                      ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container-low'
                  }`}
                  onClick={() => setSelectedBay(bay)}
                >
                  {bay}
                </button>
              ))}
            </div>
          </div>

          <div class="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant flex flex-col gap-stack-md">
            <div>
              <label class="block font-label-caps text-label-caps text-on-surface mb-stack-sm uppercase" htmlFor="truck-number">2. Truck Number</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">local_shipping</span>
                <input
                  id="truck-number"
                  class="w-full h-14 pl-10 pr-4 bg-surface border border-outline-variant rounded font-body-lg text-body-lg text-on-surface transition-shadow uppercase placeholder:text-outline focus:ring-2 focus:ring-secondary focus:border-secondary"
                  placeholder="e.g. TRK-8492"
                  required
                  type="text"
                  value={truckNumber}
                  onInput={(e) => setTruckNumber((e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
            <div>
              <label class="block font-label-caps text-label-caps text-on-surface mb-stack-sm uppercase" htmlFor="unloader-id">3. Unloader ID</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">badge</span>
                <input
                  id="unloader-id"
                  class="w-full h-14 pl-10 pr-4 bg-surface border border-outline-variant rounded font-body-lg text-body-lg text-on-surface transition-shadow uppercase placeholder:text-outline focus:ring-2 focus:ring-secondary focus:border-secondary"
                  placeholder="Scan or type ID"
                  required
                  type="text"
                  value={unloaderId}
                  onInput={(e) => setUnloaderId((e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
          </div>
        </form>
      </main>

      <div class="fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant p-margin-mobile z-40 pb-safe">
        <button
          type="button"
          class={`w-full h-14 font-headline-md text-headline-md rounded flex items-center justify-center gap-2 transition-colors shadow-sm ${
            status === 'success'
              ? 'bg-[#146c2e] text-white'
              : 'bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container active:scale-[0.98]'
          } ${status === 'processing' ? 'opacity-80' : ''}`}
          onClick={handleSubmit}
          disabled={status !== 'idle'}
        >
          {status === 'idle' && (
            <>
              <span class="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
              START SESSION
            </>
          )}
          {status === 'processing' && (
            <>
              <span class="material-symbols-outlined animate-spin">sync</span>
              PROCESSING
            </>
          )}
          {status === 'success' && (
            <>
              <span class="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              CHECKED IN
            </>
          )}
        </button>
      </div>
    </div>
  )
}
