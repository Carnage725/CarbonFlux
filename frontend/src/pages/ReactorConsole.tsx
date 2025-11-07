import { useState, useEffect } from 'react'
import { useSSE } from '../hooks/useSSE'
import { apiFetch } from '../lib/api'
import PHChart from '../components/PHChart'
import DOChart from '../components/DOChart'
import TempChart from '../components/TempChart'
import CO2UptakeChart from '../components/CO2UptakeChart'
import AlarmBadges from '../components/AlarmBadges'
import ReactorControls from '../components/ReactorControls'

interface TelemetryPoint {
  time: string
  ph: number
  do_mg_l: number
  temp_c: number
  co2_uptake_kg_h: number
  biomass_g_l: number
}

export default function ReactorConsole() {
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([])
  const [currentData, setCurrentData] = useState<TelemetryPoint | null>(null)

  // Fetch initial historical data
  useEffect(() => {
    apiFetch('/algae/telemetry?hours=2')
      .then((response) => {
        setTelemetryHistory(response.data || [])
        if (response.data && response.data.length > 0) {
          setCurrentData(response.data[response.data.length - 1])
        }
      })
      .catch((error) => console.error('Failed to fetch telemetry:', error))
  }, [])

  // SSE stream for live updates
  const { data: sseData, isConnected } = useSSE(
    `${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/algae/telemetry/stream`,
    {
      onMessage: (data) => {
        const point = data as TelemetryPoint
        setCurrentData(point)

        // Add to history, keeping last 2 hours of data (assuming 2-second intervals = ~3600 points)
        setTelemetryHistory((prev) => {
          const updated = [...prev, point]
          return updated.slice(-3600) // Keep last 3600 points
        })
      },
    }
  )

  // Use display data from current or history
  const displayData = currentData || (telemetryHistory.length > 0 ? telemetryHistory[telemetryHistory.length - 1] : null)

  // Prepare chart data (use history + current)
  const chartData = telemetryHistory.length > 0 ? telemetryHistory : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          Reactor Console
          {isConnected && (
            <span className="flex items-center gap-2 text-sm font-normal text-emerald-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live
            </span>
          )}
        </h2>
        <p className="text-slate-400 mt-2">
          Live algae photobioreactor telemetry and controls
        </p>
      </div>

      {/* Current Metrics Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">pH</div>
          <div className="text-2xl font-bold text-indigo-400">
            {displayData ? displayData.ph.toFixed(2) : '—'}
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">DO (mg/L)</div>
          <div className="text-2xl font-bold text-cyan-400">
            {displayData ? displayData.do_mg_l.toFixed(2) : '—'}
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">Temp (°C)</div>
          <div className="text-2xl font-bold text-orange-400">
            {displayData ? displayData.temp_c.toFixed(1) : '—'}
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">CO₂ Uptake</div>
          <div className={`text-2xl font-bold ${displayData && displayData.co2_uptake_kg_h > 0 ? 'text-green-400' : 'text-indigo-400'}`}>
            {displayData ? displayData.co2_uptake_kg_h.toFixed(2) : '—'}
          </div>
          <div className="text-xs text-slate-500">kg/h</div>
        </div>
      </div>

      {/* Alarm Badges */}
      {displayData && (
        <AlarmBadges
          ph={displayData.ph}
          doMgL={displayData.do_mg_l}
          tempC={displayData.temp_c}
        />
      )}

      {/* Live Telemetry Charts */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">Live Telemetry Stream</h3>
        {chartData.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-slate-500">
            Loading telemetry data...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PHChart
              data={chartData.map((d) => ({ time: d.time, ph: d.ph }))}
            />
            <DOChart
              data={chartData.map((d) => ({ time: d.time, do_mg_l: d.do_mg_l }))}
            />
            <TempChart
              data={chartData.map((d) => ({ time: d.time, temp_c: d.temp_c }))}
            />
            <CO2UptakeChart
              data={chartData.map((d) => ({ time: d.time, co2_uptake_kg_h: d.co2_uptake_kg_h }))}
            />
          </div>
        )}
      </div>

      {/* Reactor Controls */}
      <ReactorControls />
    </div>
  )
}
