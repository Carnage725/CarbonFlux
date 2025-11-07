import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  const navItems = [
    { to: '/', label: 'Overview', icon: '⚡' },
    { to: '/thermal', label: 'Thermal Twin', icon: '🔥' },
    { to: '/forecast', label: 'Forecast Lab', icon: '☀️' },
    { to: '/reactor', label: 'Reactor Console', icon: '🧪' },
    { to: '/carbon', label: 'Carbon & Exports', icon: '🌱' },
  ]

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-400">CarbonFlux</h1>
          <p className="text-slate-400 text-sm mt-1">Energy Orchestration</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-700">
          <div className="text-xs text-slate-500">
            <div>v0.1.0</div>
            <div className="mt-1">Status: <span className="text-primary-400">Operational</span></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
