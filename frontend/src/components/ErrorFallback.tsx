import { useEffect, useState } from 'react'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  showOfflineData?: boolean
  context?: string // e.g., "solar forecast", "thermal data", etc.
}

interface CachedData {
  data: any
  timestamp: number
  context: string
}

export default function ErrorFallback({
  error,
  resetError,
  showOfflineData = true,
  context = "data"
}: ErrorFallbackProps) {
  const [cachedData, setCachedData] = useState<CachedData | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (showOfflineData) {
      try {
        const cached = localStorage.getItem(`carbonflux-offline-${context}`)
        if (cached) {
          setCachedData(JSON.parse(cached))
        }
      } catch (e) {
        console.error('Failed to load cached data:', e)
      }
    }
  }, [showOfflineData, context])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await resetError()
    } catch (e) {
      console.error('Retry failed:', e)
    } finally {
      setIsRetrying(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="error-fallback glass-panel p-6 rounded-lg border border-red-500/30 bg-red-500/5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Connection Issue
          </h3>

          <p className="text-slate-300 mb-4">
            Unable to load {context}. {error.message || 'An unexpected error occurred.'}
          </p>

          {cachedData && (
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-600/50">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-1">
                <span>📁</span>
                <span>Offline Data Available</span>
              </div>
              <p className="text-slate-400 text-xs">
                Showing cached data from {formatTimestamp(cachedData.timestamp)}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800
                       text-slate-200 rounded-lg transition-colors duration-200
                       disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              {isRetrying ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Retrying...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Retry Connection
                </>
              )}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300
                       rounded-lg transition-colors duration-200 text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}