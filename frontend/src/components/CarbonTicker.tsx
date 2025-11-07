import { useEffect, useState } from 'react'

interface Props {
  cumulative: number // Total kg captured
  dailyNet: number // Daily net kg
  ratePerHour: number // Current rate kg/h
}

export default function CarbonTicker({ cumulative, dailyNet, ratePerHour }: Props) {
  const [displayValue, setDisplayValue] = useState(cumulative)

  useEffect(() => {
    // Animate counter
    const duration = 1000
    const steps = 60
    const increment = (cumulative - displayValue) / steps

    const timer = setInterval(() => {
      setDisplayValue((prev) => {
        const next = prev + increment
        if (Math.abs(next - cumulative) < Math.abs(increment)) {
          clearInterval(timer)
          return cumulative
        }
        return next
      })
    }, duration / steps)

    return () => clearInterval(timer)
  }, [cumulative])

  return (
    <div className="glass-panel p-8">
      <div className="text-center">
        <div className="text-sm text-slate-400 mb-2">Cumulative CO₂ Captured</div>
        <div className="text-6xl font-bold text-green-400 mb-4 animate-pulse">
          {displayValue.toFixed(1)} <span className="text-3xl">kg</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <div className="text-xs text-slate-500">Daily Net</div>
            <div className="text-2xl font-semibold text-primary-400">{dailyNet.toFixed(1)} kg</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Current Rate</div>
            <div className="text-2xl font-semibold text-emerald-400">
              {ratePerHour.toFixed(2)} kg/h
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
