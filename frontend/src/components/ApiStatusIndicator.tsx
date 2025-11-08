import { useEffect, useState } from 'react'

interface ApiStatusIndicatorProps {
  className?: string
}

type ConnectionStatus = 'online' | 'offline' | 'degraded' | 'checking'

export default function ApiStatusIndicator({ className = '' }: ApiStatusIndicatorProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch('/api/healthz', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          setStatus(data.status === 'healthy' ? 'online' : 'degraded')
        } else {
          setStatus('offline')
        }
      } catch (error) {
        setStatus('offline')
        console.error('API health check failed:', error)
      } finally {
        setLastCheck(new Date())
      }
    }

    // Initial check
    checkApiHealth()

    // Check every 30 seconds
    const interval = setInterval(checkApiHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/40',
          icon: '🟢',
          label: 'Online',
          description: 'All systems operational'
        }
      case 'degraded':
        return {
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500/40',
          icon: '🟡',
          label: 'Degraded',
          description: 'Some services may be slow'
        }
      case 'offline':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/40',
          icon: '🔴',
          label: 'Offline',
          description: 'Connection lost - showing cached data'
        }
      case 'checking':
        return {
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/20',
          borderColor: 'border-slate-500/40',
          icon: '⚪',
          label: 'Checking',
          description: 'Verifying connection...'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                   ${config.bgColor} ${config.borderColor} border transition-all duration-300`}
        title={`${config.label}: ${config.description}`}
      >
        <span className="text-sm">{config.icon}</span>
        <span className={config.color}>{config.label}</span>
      </div>

      {lastCheck && (
        <span className="text-xs text-slate-500 hidden sm:inline">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}