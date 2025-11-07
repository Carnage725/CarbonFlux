import { useEffect, useState } from 'react'

interface UseSSEOptions {
  onMessage?: (data: unknown) => void
  onError?: (error: Event) => void
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<Event | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        setData(parsed)
        options.onMessage?.(parsed)
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
    }
  }, [url])

  return { data, error, isConnected }
}
