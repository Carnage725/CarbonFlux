export default function ThermalTwin() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Thermal Twin</h2>
        <p className="text-slate-400 mt-2">
          Molten-salt storage simulation and thermal dynamics
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Hot Tank</h3>
          <div className="text-2xl font-bold text-orange-400">591°C</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Cold Tank</h3>
          <div className="text-2xl font-bold text-blue-400">296°C</div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">Temperature & SOC Timeline</h3>
        <div className="h-96 flex items-center justify-center text-slate-500">
          D3 Dual-Axis Temperature Chart (Phase 6)
        </div>
      </div>
    </div>
  )
}
