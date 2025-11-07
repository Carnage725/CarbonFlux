interface AlarmBadgesProps {
  ph: number
  doMgL: number
  tempC: number
}

export default function AlarmBadges({ ph, doMgL, tempC }: AlarmBadgesProps) {
  // Alarm conditions
  const o2Inhibition = doMgL > 10
  const phOutOfRange = ph < 6.8 || ph > 7.6
  const overtemp = tempC > 28

  const hasAnyAlarm = o2Inhibition || phOutOfRange || overtemp

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center py-4">
      <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
        Alarm Status:
      </div>

      {!hasAnyAlarm && (
        <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold text-sm animate-pulse">
          ✓ All Systems Normal
        </div>
      )}

      {o2Inhibition && (
        <div className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-semibold text-sm flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
          <span>⚠ O₂ Inhibition Risk</span>
          <span className="text-xs opacity-75">({doMgL.toFixed(1)} mg/L)</span>
        </div>
      )}

      {phOutOfRange && (
        <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-semibold text-sm flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
          <span>⚠ pH Out of Range</span>
          <span className="text-xs opacity-75">({ph.toFixed(2)})</span>
        </div>
      )}

      {overtemp && (
        <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-semibold text-sm flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
          <span>⚠ Overtemp</span>
          <span className="text-xs opacity-75">({tempC.toFixed(1)}°C)</span>
        </div>
      )}
    </div>
  )
}
