import { useState } from 'react'
import { apiPost } from '../lib/api'

export default function ReactorControls() {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleControl = async (action: string) => {
    setLoading(true)
    try {
      const response = await apiPost('/algae/control', { action })
      setActiveAction(action)

      // Auto-reset after duration
      const duration = response.duration_seconds || 30
      setTimeout(() => {
        setActiveAction(null)
      }, duration * 1000)
    } catch (error) {
      console.error('Control action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const buttons = [
    {
      action: 'degas',
      label: 'Degas Now',
      icon: '💨',
      description: 'Reduce DO temporarily',
      color: 'cyan',
    },
    {
      action: 'aerate',
      label: 'Aerate Burst',
      icon: '🌊',
      description: 'Increase DO temporarily',
      color: 'blue',
    },
    {
      action: 'night_mode',
      label: 'Night Mode',
      icon: '🌙',
      description: 'Reduce light & CO₂ uptake',
      color: 'indigo',
    },
  ]

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-2xl">🎛️</span>
        Reactor Controls
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buttons.map((btn) => {
          const isActive = activeAction === btn.action
          const colorClasses = {
            cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30',
            blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30',
            indigo: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/30',
          }[btn.color]

          return (
            <button
              key={btn.action}
              onClick={() => handleControl(btn.action)}
              disabled={loading || isActive}
              className={`
                relative px-6 py-4 rounded-lg border-2 font-semibold
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${colorClasses}
                ${isActive ? 'animate-pulse ring-2 ring-offset-2 ring-offset-slate-900' : ''}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{btn.icon}</span>
                <span className="text-sm">{btn.label}</span>
                <span className="text-xs opacity-70">{btn.description}</span>
                {isActive && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {activeAction && (
        <div className="mt-4 text-center text-sm text-emerald-400 animate-pulse">
          ✓ {buttons.find(b => b.action === activeAction)?.label} Active
        </div>
      )}
    </div>
  )
}
