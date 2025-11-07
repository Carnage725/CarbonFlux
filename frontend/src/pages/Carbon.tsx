export default function Carbon() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Carbon & Exports</h2>
        <p className="text-slate-400 mt-2">
          Carbon capture ledger and audit artifacts
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Total CO₂ In</h3>
          <div className="text-2xl font-bold">1,847 kg</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Total CO₂ Fixed</h3>
          <div className="text-2xl font-bold text-primary-400">1,284 kg</div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2">Net Captured</h3>
          <div className="text-2xl font-bold text-green-400">936 kg</div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Cumulative Capture</h3>
          <div className="space-x-2">
            <button className="glass-button text-sm">Export CSV</button>
            <button className="glass-button text-sm">Export JSON</button>
          </div>
        </div>
        <div className="h-96 flex items-center justify-center text-slate-500">
          D3 Cumulative + Daily Bar Chart (Phase 9)
        </div>
      </div>
    </div>
  )
}
