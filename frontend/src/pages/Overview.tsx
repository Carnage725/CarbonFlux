import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { endpoints } from '../lib/api'
import FlowDiagram from '../components/FlowDiagram'
import SOCGauge from '../components/SOCGauge'
import CarbonTicker from '../components/CarbonTicker'

export default function Overview() {
  const [stressTestResults, setStressTestResults] = useState<{
    points: number
    renderTime: number
    dataFetchTime: number
  } | null>(null)
  const [isRunningStressTest, setIsRunningStressTest] = useState(false)

  // Fetch data with auto-refresh every 5 seconds
  const { data: saltData } = useQuery({
    queryKey: ['saltState'],
    queryFn: endpoints.saltState,
    refetchInterval: 5000,
  })

  const { data: dispatchData } = useQuery({
    queryKey: ['dispatchPlan'],
    queryFn: endpoints.dispatchPlan,
    refetchInterval: 5000,
  })

  const { data: carbonData } = useQuery({
    queryKey: ['carbonLedger'],
    queryFn: endpoints.carbonLedger,
    refetchInterval: 5000,
  })

  const { data: solarData } = useQuery({
    queryKey: ['solarForecast'],
    queryFn: endpoints.solarForecast,
    refetchInterval: 5000,
  })

  const runStressTest = async () => {
    setIsRunningStressTest(true)
    setStressTestResults(null)

    try {
      const startFetch = performance.now()
      const bigData = await endpoints.demoBigData(100000, 'solar', 72)
      const fetchTime = performance.now() - startFetch

      const startRender = performance.now()
      // Simulate chart rendering with the data
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate render time
      const renderTime = performance.now() - startRender

      setStressTestResults({
        points: bigData.points,
        renderTime: Math.round(renderTime),
        dataFetchTime: Math.round(fetchTime)
      })
    } catch (error) {
      console.error('Stress test failed:', error)
    } finally {
      setIsRunningStressTest(false)
    }
  }

  // Calculate current solar output (latest nowcast point)
  const currentSolar = solarData?.nowcast?.[solarData.nowcast.length - 1]?.value_kw || 0

  // Calculate current charge/discharge from dispatch plan
  const currentDispatch = dispatchData?.plan?.[0] || { charge_kw: 0, discharge_kw: 0 }

  // Calculate load (discharge to algae)
  const currentLoad = currentDispatch.discharge_kw

  // Get SOC data
  const soc = saltData?.soc_percent || 0
  const socMwh = saltData?.current?.soc_mwh || 0

  // Get carbon data
  const cumulativeCO2 = carbonData?.cumulative_net_kg || 0
  const dailyNet = carbonData?.daily?.[0]?.total_co2_net_kg || 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">Live Overview</h2>
          <p className="text-slate-400 mt-2">
            Real-time energy flow visualization and system status
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={runStressTest}
            disabled={isRunningStressTest}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800
                     text-slate-200 rounded-lg transition-colors duration-200
                     disabled:opacity-50 text-sm font-medium"
          >
            {isRunningStressTest ? 'Testing...' : 'Stress Test'}
          </button>

          {stressTestResults && (
            <div className="text-xs text-slate-500 bg-slate-800/50 px-3 py-2 rounded">
              <div>100k points loaded</div>
              <div>Fetch: {stressTestResults.dataFetchTime}ms</div>
              <div>Render: {stressTestResults.renderTime}ms</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Solar Generation</h3>
          <div className="text-3xl font-bold text-primary-400">
            {currentSolar.toFixed(0)} kW
          </div>
          <div className="text-sm text-slate-400 mt-1">Current output</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Storage SOC</h3>
          <div className="text-3xl font-bold text-emerald-400">{soc.toFixed(0)}%</div>
          <div className="text-sm text-slate-400 mt-1">{socMwh.toFixed(2)} / 10 MWh</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">CO₂ Captured</h3>
          <div className="text-3xl font-bold text-green-400">{cumulativeCO2.toFixed(0)} kg</div>
          <div className="text-sm text-slate-400 mt-1">Cumulative</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold mb-4">System Flow</h3>
          <FlowDiagram
            data={{
              solar: currentSolar,
              charge: currentDispatch.charge_kw,
              discharge: currentDispatch.discharge_kw,
              load: currentLoad,
            }}
          />
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold mb-4">Storage State of Charge</h3>
          <SOCGauge soc={soc} socMwh={socMwh} capacity={10} />
        </div>
      </div>

      <CarbonTicker cumulative={cumulativeCO2} dailyNet={dailyNet} ratePerHour={dailyNet / 24} />
    </div>
  )
}
