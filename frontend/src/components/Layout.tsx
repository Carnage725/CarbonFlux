import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import LiveIndicator from './LiveIndicator'
import ApiStatusIndicator from './ApiStatusIndicator'
import DemoController from './DemoController'

export default function Layout() {
  const [showDemo, setShowDemo] = useState(false)

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
          <div className="text-xs text-slate-500 space-y-2">
            <div>v0.1.0</div>
            <div className="flex items-center justify-between">
              <span>Status: <span className="text-primary-400">Operational</span></span>
              <LiveIndicator />
            </div>
            <ApiStatusIndicator />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Demo Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowDemo(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg
                     font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <span>🎭</span>
            Demo
          </button>
        </div>

        <Outlet />
      </main>

      {/* Demo Controller */}
      <DemoController isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  )
}
