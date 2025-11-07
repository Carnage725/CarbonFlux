import { useQuery } from '@tanstack/react-query'
import { endpoints } from '../lib/api'
import ThermalChart from '../components/ThermalChart'
import HeatLossDonut from '../components/HeatLossDonut'
import EfficiencyTile from '../components/EfficiencyTile'

export default function ThermalTwin() {
  // Fetch salt state with auto-refresh
  const { data: saltData } = useQuery({
    queryKey: ['saltState'],
    queryFn: endpoints.saltState,
    refetchInterval: 5000,
  })

  // Fetch dispatch plan for event overlays
  const { data: dispatchData } = useQuery({
    queryKey: ['dispatchPlan'],
    queryFn: endpoints.dispatchPlan,
    refetchInterval: 5000,
  })

  const currentTemp = saltData?.current || {
    temp_hot_c: 0,
    temp_cold_c: 0,
    heat_loss_kw: 0,
  }

  const history = saltData?.history_24h || []
  const dispatchEvents = dispatchData?.plan || []

  // Calculate efficiency (rough estimate: discharge / charge)
  const totalCharge = dispatchEvents.reduce((sum: number, p: any) => sum + p.charge_kw, 0)
  const totalDischarge = dispatchEvents.reduce((sum: number, p: any) => sum + p.discharge_kw, 0)
  const efficiency = totalCharge > 0 ? (totalDischarge / totalCharge) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Thermal Twin</h2>
        <p className="text-slate-400 mt-2">
          Molten-salt storage simulation and thermal dynamics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Hot Tank</h3>
          <div className="text-3xl font-bold text-orange-400">
            {currentTemp.temp_hot_c.toFixed(1)}°C
          </div>
          <div className="text-sm text-slate-400 mt-1">Current temperature</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Cold Tank</h3>
          <div className="text-3xl font-bold text-blue-400">
            {currentTemp.temp_cold_c.toFixed(1)}°C
          </div>
          <div className="text-sm text-slate-400 mt-1">Current temperature</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Heat Loss</h3>
          <div className="text-3xl font-bold text-red-400">
            {currentTemp.heat_loss_kw.toFixed(1)} kW
          </div>
          <div className="text-sm text-slate-400 mt-1">Current loss rate</div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">Temperature & SOC Timeline (24h)</h3>
        {history.length > 0 ? (
          <ThermalChart data={history} dispatchEvents={dispatchEvents.slice(0, 100)} />
        ) : (
          <div className="h-96 flex items-center justify-center text-slate-500">
            Loading data...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold mb-4">Heat Loss Breakdown</h3>
          <HeatLossDonut heatLossKw={currentTemp.heat_loss_kw} totalCapacity={10} />
        </div>

        <EfficiencyTile efficiency={efficiency} trend="stable" />
      </div>
    </div>
  )
}
