import { useEffect, useState, useRef, useCallback } from 'react'

interface UseSSEOptions {
  onMessage?: (data: unknown) => void
  onError?: (error: Event) => void
  throttleMs?: number // Throttle updates to prevent excessive re-renders (default: 100ms = 10 updates/sec)
  maxRetries?: number // Maximum number of retry attempts (default: 10)
  onConnectionQualityChange?: (quality: 'good' | 'fair' | 'poor') => void
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<Event | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good')
  const [retryCount, setRetryCount] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const throttleMs = options.throttleMs ?? 100 // Default: 10 updates/sec for 60 FPS smoothness
  const maxRetries = options.maxRetries ?? 10
  const throttleRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const connectionStatsRef = useRef({
    connectTime: 0,
    disconnectTime: 0,
    messageCount: 0,
    errorCount: 0
  })

  const updateConnectionQuality = useCallback(() => {
    const stats = connectionStatsRef.current
    const now = Date.now()

    // Calculate connection uptime percentage over last 5 minutes
    const timeWindow = 5 * 60 * 1000 // 5 minutes
    const uptimeRatio = stats.connectTime > 0 ?
      (now - stats.disconnectTime) / timeWindow : 0

    // Calculate error rate
    const totalEvents = stats.messageCount + stats.errorCount
    const errorRate = totalEvents > 0 ? stats.errorCount / totalEvents : 0

    let quality: 'good' | 'fair' | 'poor'
    if (uptimeRatio > 0.95 && errorRate < 0.05) {
      quality = 'good'
    } else if (uptimeRatio > 0.8 && errorRate < 0.15) {
      quality = 'fair'
    } else {
      quality = 'poor'
    }

    if (quality !== connectionQuality) {
      setConnectionQuality(quality)
      options.onConnectionQualityChange?.(quality)
    }
  }, [connectionQuality, options])

  const throttledSetData = useCallback((newData: unknown) => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    if (timeSinceLastUpdate >= throttleMs) {
      // Immediate update if enough time has passed
      setData(newData)
      options.onMessage?.(newData)
      lastUpdateRef.current = now
      connectionStatsRef.current.messageCount++
      updateConnectionQuality()
    } else if (!throttleRef.current) {
      // Schedule throttled update
      throttleRef.current = setTimeout(() => {
        setData(newData)
        options.onMessage?.(newData)
        lastUpdateRef.current = Date.now()
        throttleRef.current = null
        connectionStatsRef.current.messageCount++
        updateConnectionQuality()
      }, throttleMs - timeSinceLastUpdate)
    }
    // If already scheduled, ignore this update (throttled)
  }, [throttleMs, options, updateConnectionQuality])

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('SSE connected to', url)
      setIsConnected(true)
      setError(null)
      setIsReconnecting(false)
      setRetryCount(0)
      connectionStatsRef.current.connectTime = Date.now()
      updateConnectionQuality()
    }

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        throttledSetData(parsed)
      } catch (e) {
        console.error('Failed to parse SSE data:', e)
        connectionStatsRef.current.errorCount++
        updateConnectionQuality()
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      setError(err)
      setIsConnected(false)
      connectionStatsRef.current.disconnectTime = Date.now()
      connectionStatsRef.current.errorCount++
      updateConnectionQuality()

      eventSource.close()

      // Exponential backoff retry
      if (retryCount < maxRetries) {
        setIsReconnecting(true)
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000) // Max 30s

        reconnectTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1)
          connect()
        }, delay)
      } else {
        console.error('Max SSE retry attempts reached')
        options.onError?.(err)
      }
    }
  }, [url, retryCount, maxRetries, throttledSetData, options, updateConnectionQuality])

  useEffect(() => {
    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  const manualReconnect = useCallback(() => {
    setRetryCount(0)
    connect()
  }, [connect])

  return {
    data,
    error,
    isConnected,
    connectionQuality,
    retryCount,
    isReconnecting,
    manualReconnect
  }
}
