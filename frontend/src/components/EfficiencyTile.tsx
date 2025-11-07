interface Props {
  efficiency: number // Percentage 0-100
  trend?: 'up' | 'down' | 'stable'
}

export default function EfficiencyTile({ efficiency, trend = 'stable' }: Props) {
  let color = '#10b981' // Green >80%
  if (efficiency < 70) color = '#ef4444' // Red <70%
  else if (efficiency < 80) color = '#f59e0b' // Amber 70-80%

  const trendIcon = {
    up: '↑',
    down: '↓',
    stable: '→',
  }

  const trendColor = {
    up: '#10b981',
    down: '#ef4444',
    stable: '#94a3b8',
  }

  return (
    <div className="glass-panel p-6">
      <div className="text-sm text-slate-400 mb-2">Round-Trip Efficiency</div>
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-bold" style={{ color }}>
          {efficiency.toFixed(1)}%
        </div>
        <div className="text-2xl" style={{ color: trendColor[trend] }}>
          {trendIcon[trend]}
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-2">
        {efficiency >= 80 ? 'Optimal' : efficiency >= 70 ? 'Good' : 'Needs attention'}
      </div>
    </div>
  )
}
