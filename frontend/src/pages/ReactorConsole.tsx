export default function ReactorConsole() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Reactor Console</h2>
        <p className="text-slate-400 mt-2">
          Live algae photobioreactor telemetry and controls
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">pH</div>
          <div className="text-2xl font-bold">7.16</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">DO (mg/L)</div>
          <div className="text-2xl font-bold">5.85</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">Temp (°C)</div>
          <div className="text-2xl font-bold">24.2</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-sm text-slate-400">CO₂ Uptake</div>
          <div className="text-2xl font-bold text-green-400">-0.18</div>
          <div className="text-xs text-slate-500">kg/h</div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">Live Telemetry Stream</h3>
        <div className="h-96 flex items-center justify-center text-slate-500">
          D3 Linked Multi-Chart with SSE Stream (Phase 8)
        </div>
      </div>
    </div>
  )
}
