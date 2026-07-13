import { useLocation } from 'preact-iso'
import { isSidebarOpen } from '../store'

export function Sidebar() {
  const { url } = useLocation()
  const open = isSidebarOpen.value

  const toggleSidebar = () => {
    isSidebarOpen.value = !open
  }

  const navLinks = [
    { href: '/tablet', icon: 'tablet_mac', label: 'Tablet Input' },
    { href: '/batch', icon: 'dataset', label: 'Batch Entry' },
    { href: '/floor', icon: 'dashboard', label: 'Real-time Floor', match: ['/', '/floor'] },
    { href: '/analytics', icon: 'analytics', label: 'Management Analytics' },
    { href: '#', icon: 'group_work', label: 'Resource Allocation' },
    { href: '#', icon: 'history', label: 'Historical Reports' },
    { href: '/admin', icon: 'settings', label: 'Admin Settings' },
  ]

  return (
    <aside class={`flex flex-col h-screen py-6 px-4 bg-surface fixed left-0 top-0 border-r border-outline-variant z-50 transition-all duration-300 ${open ? 'w-64' : 'w-20 items-center px-2'}`}>
      <div class="mb-10 flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary rounded cursor-pointer shrink-0" onClick={toggleSidebar}>
            <span class="material-symbols-outlined text-on-primary">hub</span>
          </div>
          {open && (
            <div class="whitespace-nowrap overflow-hidden transition-all duration-300">
              <h1 class="font-headline-md text-headline-md font-bold text-primary leading-none m-0 p-0">Logistics Hub</h1>
              <p class="font-label-caps text-label-caps opacity-70 m-0 p-0">Site WH-042</p>
            </div>
          )}
        </div>
      </div>
      <nav class="flex-1 space-y-2 w-full">
        {navLinks.map(link => {
          const isActive = link.match ? link.match.includes(url) : url === link.href
          return (
            <a 
              key={link.href}
              href={link.href} 
              title={!open ? link.label : ''}
              class={`flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer text-decoration-none rounded ${
                isActive
                  ? 'text-secondary font-bold bg-surface-container' 
                  : 'text-on-surface-variant hover:bg-surface-container'
              } ${!open ? 'justify-center w-full px-0' : 'border-r-4 border-transparent hover:border-outline-variant'} ${isActive && open ? 'border-r-4 border-secondary' : ''}`}
            >
              <span class="material-symbols-outlined shrink-0">{link.icon}</span>
              {open && <span class="font-label-caps text-label-caps whitespace-nowrap">{link.label}</span>}
            </a>
          )
        })}
      </nav>
      <button 
        class={`mb-8 w-full py-3 bg-secondary text-white font-label-caps text-label-caps rounded flex items-center justify-center gap-2 scale-95 active:scale-90 transition-all ${!open && 'p-3 w-12 h-12'}`}
        title={!open ? "New Alert" : ""}
      >
        <span class="material-symbols-outlined shrink-0">add_alert</span>
        {open && <span class="whitespace-nowrap">New Alert</span>}
      </button>
      <div class="pt-6 border-t border-outline-variant space-y-2 w-full">
        <div 
          class={`flex items-center gap-3 py-2 transition-colors cursor-pointer text-on-surface-variant hover:bg-surface-container rounded ${open ? 'px-4' : 'justify-center w-full px-0'}`}
          title={!open ? "Support" : ""}
        >
          <span class="material-symbols-outlined shrink-0">help</span>
          {open && <span class="font-label-caps text-label-caps whitespace-nowrap">Support</span>}
        </div>
      </div>
    </aside>
  )
}
