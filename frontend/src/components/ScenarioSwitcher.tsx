import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '../lib/api'
import { useAppStore } from '../store/appStore'

const scenarios = [
  { value: 'clear', label: 'Clear Sky', description: 'Normal operations', icon: '☀️' },
  { value: 'cloudy', label: 'Cloudy', description: '50-70% solar output', icon: '☁️' },
  { value: 'heatwave', label: 'Heatwave', description: '50% higher heat loss', icon: '🔥' },
  { value: 'maintenance', label: 'Maintenance', description: '60% bioreactor capacity', icon: '🔧' },
]

export default function ScenarioSwitcher() {
  const { currentScenario, setScenario } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const switchMutation = useMutation({
    mutationFn: (type: string) => endpoints.switchScenario(type),
    onSuccess: (_, type) => {
      setScenario(type)
      // Invalidate all queries to force refetch
      queryClient.invalidateQueries()
      setIsOpen(false)
    },
  })

  const currentScenarioData = scenarios.find((s) => s.value === currentScenario) || scenarios[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel px-4 py-3 flex items-center gap-3 hover:bg-slate-700/60 transition-all duration-300"
        disabled={switchMutation.isPending}
      >
        <span className="text-2xl">{currentScenarioData.icon}</span>
        <div className="text-left">
          <div className="font-semibold">{currentScenarioData.label}</div>
          <div className="text-xs text-slate-400">{currentScenarioData.description}</div>
        </div>
        <span className="ml-2 text-slate-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full glass-panel p-2 z-10">
          {scenarios.map((scenario) => (
            <button
              key={scenario.value}
              onClick={() => switchMutation.mutate(scenario.value)}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-slate-600/50 transition-all duration-300 ${
                currentScenario === scenario.value ? 'bg-primary-600/30' : ''
              }`}
              disabled={switchMutation.isPending}
            >
              <span className="text-2xl">{scenario.icon}</span>
              <div className="text-left flex-1">
                <div className="font-semibold">{scenario.label}</div>
                <div className="text-xs text-slate-400">{scenario.description}</div>
              </div>
              {currentScenario === scenario.value && <span className="text-primary-400">✓</span>}
            </button>
          ))}
        </div>
      )}

      {switchMutation.isPending && (
        <div className="absolute inset-0 glass-panel flex items-center justify-center">
          <div className="text-sm text-slate-300">Switching scenario...</div>
        </div>
      )}
    </div>
  )
}
