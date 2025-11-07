import { useQuery } from '@tanstack/react-query'
import { endpoints } from '../lib/api'
import SolarForecastChart from '../components/SolarForecastChart'
import ScenarioSwitcher from '../components/ScenarioSwitcher'
import { useAppStore } from '../store/appStore'

export default function ForecastLab() {
  const { currentScenario } = useAppStore()

  // Fetch solar forecast with auto-refresh
  const { data: solarData } = useQuery({
    queryKey: ['solarForecast'],
    queryFn: endpoints.solarForecast,
    refetchInterval: 10000,
  })

  // Fetch green windows
  const { data: greenWindowsData } = useQuery({
    queryKey: ['greenWindows'],
    queryFn: endpoints.greenWindows,
    refetchInterval: 10000,
  })

  const forecast = solarData?.forecast || []
  const greenWindows = greenWindowsData?.windows || []

  // Calculate summary stats
  const peakForecast = forecast.length > 0 ? Math.max(...forecast.map((f: any) => f.p95)) : 0
  const avgForecast =
    forecast.length > 0
      ? forecast.reduce((sum: number, f: any) => sum + f.p50, 0) / forecast.length
      : 0
  const greenHours =
    greenWindows.reduce((sum: number, w: any) => {
      const start = new Date(w.start_time)
      const end = new Date(w.end_time)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Forecast Lab</h2>
          <p className="text-slate-400 mt-2">
            Solar forecasts and green window optimization
          </p>
        </div>
        <ScenarioSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">Peak Forecast (P95)</div>
          <div className="text-2xl font-bold text-primary-400">{peakForecast.toFixed(0)} kW</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">Average (P50)</div>
          <div className="text-2xl font-bold text-emerald-400">{avgForecast.toFixed(0)} kW</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">Green Windows</div>
          <div className="text-2xl font-bold text-green-400">{greenWindows.length}</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">Green Hours</div>
          <div className="text-2xl font-bold text-green-400">{greenHours.toFixed(1)} h</div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">72-Hour Solar Forecast</h3>
          <div className="text-sm text-slate-400">
            Scenario: <span className="text-primary-400 font-semibold">{currentScenario}</span>
          </div>
        </div>
        {forecast.length > 0 ? (
          <SolarForecastChart forecast={forecast} greenWindows={greenWindows} />
        ) : (
          <div className="h-96 flex items-center justify-center text-slate-500">
            Loading forecast data...
          </div>
        )}
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">Green Windows Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {greenWindows.slice(0, 6).map((window: any, idx: number) => {
            const start = new Date(window.start_time).toLocaleString()
            const end = new Date(window.end_time).toLocaleString()
            return (
              <div key={idx} className="glass-panel p-4">
                <div className="text-xs text-slate-500">Window #{idx + 1}</div>
                <div className="text-sm text-slate-300 mt-1">
                  {start.split(',')[1]} - {end.split(',')[1]}
                </div>
                <div className="text-lg font-semibold text-green-400 mt-2">
                  {window.carbon_gco2_kwh.toFixed(0)} gCO₂/kWh
                </div>
                <div className="text-xs text-slate-400">
                  {window.duration_hours.toFixed(1)} hours
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
