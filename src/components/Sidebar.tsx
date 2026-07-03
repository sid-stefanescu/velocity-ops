import { useLocation } from 'preact-iso'

export function Sidebar() {
  const { url } = useLocation()

  return (
    <aside class="flex flex-col h-screen py-6 px-4 bg-surface h-full w-64 fixed left-0 top-0 border-r border-outline-variant z-50">
      <div class="mb-10 flex items-center gap-3">
        <div class="p-2 bg-primary rounded">
          <span class="material-symbols-outlined text-on-primary">hub</span>
        </div>
        <div>
          <h1 class="font-headline-md text-headline-md font-bold text-primary leading-none m-0 p-0">Logistics Hub</h1>
          <p class="font-label-caps text-label-caps opacity-70 m-0 p-0">Site WH-042</p>
        </div>
      </div>
      <nav class="flex-1 space-y-2">
        <a 
          href="/checkin" 
          class={`flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer text-decoration-none ${
            url === '/checkin'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container' 
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span class="material-symbols-outlined">how_to_reg</span>
          <span class="font-label-caps text-label-caps">Unloader Check-in</span>
        </a>
        <a 
          href="/floor" 
          class={`flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer text-decoration-none ${
            url === '/floor' || url === '/'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container' 
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span class="material-symbols-outlined">dashboard</span>
          <span class="font-label-caps text-label-caps">Real-time Floor</span>
        </a>
        <a 
          href="/analytics" 
          class={`flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer text-decoration-none ${
            url === '/analytics'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container' 
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span class="material-symbols-outlined">analytics</span>
          <span class="font-label-caps text-label-caps">Management Analytics</span>
        </a>
        <a href="#" class="flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer text-on-surface-variant hover:bg-surface-container text-decoration-none">
          <span class="material-symbols-outlined">group_work</span>
          <span class="font-label-caps text-label-caps">Resource Allocation</span>
        </a>
        <a href="#" class="flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer text-on-surface-variant hover:bg-surface-container text-decoration-none">
          <span class="material-symbols-outlined">history</span>
          <span class="font-label-caps text-label-caps">Historical Reports</span>
        </a>
        <a href="#" class="flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer text-on-surface-variant hover:bg-surface-container text-decoration-none">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-label-caps text-label-caps">System Settings</span>
        </a>
      </nav>
      <button class="mb-8 w-full py-3 bg-secondary text-white font-label-caps text-label-caps rounded flex items-center justify-center gap-2 scale-95 active:scale-90 transition-transform">
        <span class="material-symbols-outlined">add_alert</span>
        New Alert
      </button>
      <div class="pt-6 border-t border-outline-variant space-y-2">
        <div class="flex items-center gap-3 py-2 px-4 transition-colors cursor-pointer text-on-surface-variant hover:bg-surface-container">
          <span class="material-symbols-outlined">help</span>
          <span class="font-label-caps text-label-caps">Support</span>
        </div>
      </div>
    </aside>
  )
}
