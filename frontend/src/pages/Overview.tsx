export default function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Live Overview</h2>
        <p className="text-slate-400 mt-2">
          Real-time energy flow visualization and system status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Solar Generation</h3>
          <div className="text-3xl font-bold text-primary-400">847 kW</div>
          <div className="text-sm text-slate-400 mt-1">Current output</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Storage SOC</h3>
          <div className="text-3xl font-bold text-emerald-400">78%</div>
          <div className="text-sm text-slate-400 mt-1">7.82 / 10 MWh</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">CO₂ Captured</h3>
          <div className="text-3xl font-bold text-green-400">936 kg</div>
          <div className="text-sm text-slate-400 mt-1">Cumulative</div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">System Flow</h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          D3 Sankey Flow Diagram (Phase 5)
        </div>
      </div>
    </div>
  )
}
