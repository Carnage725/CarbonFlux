import { useEffect, useState, useRef, useCallback } from 'react'

interface UseSSEOptions {
  onMessage?: (data: unknown) => void
  onError?: (error: Event) => void
  throttleMs?: number // Throttle updates to prevent excessive re-renders (default: 100ms = 10 updates/sec)
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<Event | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const throttleMs = options.throttleMs ?? 100 // Default: 10 updates/sec for 60 FPS smoothness
  const throttleRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  const throttledSetData = useCallback((newData: unknown) => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    if (timeSinceLastUpdate >= throttleMs) {
      // Immediate update if enough time has passed
      setData(newData)
      options.onMessage?.(newData)
      lastUpdateRef.current = now
    } else if (!throttleRef.current) {
      // Schedule throttled update
      throttleRef.current = setTimeout(() => {
        setData(newData)
        options.onMessage?.(newData)
        lastUpdateRef.current = Date.now()
        throttleRef.current = null
      }, throttleMs - timeSinceLastUpdate)
    }
    // If already scheduled, ignore this update (throttled)
  }, [throttleMs, options])

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        throttledSetData(parsed)
      } catch (e) {
        console.error('Failed to parse SSE data:', e)
      }
    }

    eventSource.onerror = (err) => {
      setError(err)
      setIsConnected(false)
      options.onError?.(err)
      eventSource.close()

      // Auto-retry after 5 seconds
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    }

    return () => {
      eventSource.close()
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
    }
  }, [url, throttledSetData, options])

  return { data, error, isConnected }
}
