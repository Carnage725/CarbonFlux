import { useEffect, useState } from 'react'

interface LiveIndicatorProps {
  className?: string
}

export default function LiveIndicator({ className = '' }: LiveIndicatorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    // Check refresh status every 5 seconds
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/healthz')
        await response.json()

        // Assume refresh happens every 60 seconds
        // We can enhance this by adding a refresh timestamp to the health endpoint
        const now = new Date()
        const secondsSinceRefresh = lastRefresh
          ? (now.getTime() - lastRefresh.getTime()) / 1000
          : 70 // Force initial refresh indication

        if (secondsSinceRefresh > 55) { // Show "refreshing" in last 5 seconds of cycle
          setIsRefreshing(true)
          setLastRefresh(now)
          // Hide after 2 seconds
          setTimeout(() => setIsRefreshing(false), 2000)
        }
      } catch (error) {
        console.error('Failed to check refresh status:', error)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [lastRefresh])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isRefreshing
              ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50'
              : 'bg-green-600'
          }`}
        />
        <span className="text-xs text-slate-400 font-medium">
          {isRefreshing ? 'LIVE' : 'SYNC'}
        </span>
      </div>
    </div>
  )
}