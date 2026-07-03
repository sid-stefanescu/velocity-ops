export function TopAppBar({ 
  title = "Warehouse Operations",
  activeTab = "Operational",
  showSearch = false
}) {
  return (
    <header class="flex justify-between items-center w-full px-gutter h-16 bg-surface sticky top-0 z-40 border-b border-outline-variant">
      <div class="flex items-center gap-6">
        <h2 class="font-headline-md text-headline-md font-bold text-primary m-0 p-0">{title}</h2>
        
        {showSearch && (
          <div class="relative flex items-center hidden md:flex">
            <span class="material-symbols-outlined absolute left-3 text-outline">search</span>
            <input 
              class="bg-surface-container-low border border-outline-variant pl-10 pr-4 py-1.5 rounded-lg w-64 text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary" 
              placeholder="Search insights..." 
              type="text"
            />
          </div>
        )}

        {!showSearch && (
          <div class="hidden md:flex gap-4">
            <a class={`font-label-caps text-label-caps text-decoration-none ${activeTab === 'Operational' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary transition-colors'}`} href="#">Operational</a>
            <a class={`font-label-caps text-label-caps text-decoration-none ${activeTab === 'Strategic' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary transition-colors'}`} href="#">Strategic</a>
            <a class={`font-label-caps text-label-caps text-decoration-none ${activeTab === 'Fleet' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary transition-colors'}`} href="#">Fleet</a>
          </div>
        )}
      </div>

      {showSearch && (
        <nav class="hidden md:flex gap-6 items-center">
          <a class={`font-label-caps text-label-caps text-decoration-none ${activeTab === 'Operational' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary transition-colors'}`} href="#">Operational</a>
          <a class={`font-label-caps text-label-caps text-decoration-none ${activeTab === 'Strategic' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary transition-colors'}`} href="#">Strategic</a>
          <a class={`font-label-caps text-label-caps text-decoration-none ${activeTab === 'Fleet' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary transition-colors'}`} href="#">Fleet</a>
        </nav>
      )}

      <div class="flex items-center gap-4">
        <button class="px-4 py-1.5 bg-error text-white font-label-caps text-label-caps rounded animate-pulse border-none cursor-pointer hidden sm:block">Emergency Stop</button>
        <div class="h-8 w-px bg-outline-variant hidden sm:block"></div>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined p-2 hover:bg-surface-container cursor-pointer rounded-full transition-colors">notifications</span>
          <span class="material-symbols-outlined p-2 hover:bg-surface-container cursor-pointer rounded-full transition-colors">sync</span>
        </div>
        <div class="w-10 h-10 rounded-full border border-outline object-cover bg-secondary-container flex items-center justify-center overflow-hidden">
          <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfiEDYbJthS9bAsLxi2X993izTKnbbcxgShtWZRKkt0MSOKB4Rlzo9Z6c4cqn2_GtnHQk4C_PrlQ5nWKZwERK3HqHTs-vNCCdQFywj9sD7tjrrs4y3SryML3naLkLw3vJ1DHrwkrjMOauktr1YDl_ZoEwNDh4seGaygYZDPGbz8Udhs6oeLOUdX5d4Ki-zBxGGUbArgm91XNAsxfiuAi38iBf9kCs27qtOvLYzLI-_4kS5tr5mkBKT40Yg_AcSZ15GNGJL44xBOCw" />
        </div>
      </div>
    </header>
  )
}
