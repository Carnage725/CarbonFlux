export default function ForecastLab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Forecast Lab</h2>
        <p className="text-slate-400 mt-2">
          Solar forecasts and green window optimization
        </p>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">72-Hour Solar Forecast</h3>
        <div className="h-96 flex items-center justify-center text-slate-500">
          D3 Fan Chart with P5/P50/P95 (Phase 7)
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-4">Green Windows</h3>
        <div className="h-48 flex items-center justify-center text-slate-500">
          Low-carbon energy intervals visualization
        </div>
      </div>
    </div>
  )
}
