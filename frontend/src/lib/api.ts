import { OfflineStorage } from './offlineStorage'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const api = {
  async get(path: string, context?: string) {
    try {
      const response = await fetch(`${API_BASE}${path}`)
      if (!response.ok) throw new Error(`API error: ${response.statusText}`)
      const data = await response.json()

      // Cache successful responses for offline use
      if (context) {
        OfflineStorage.cacheData(context, data)
      }

      return data
    } catch (error) {
      // Try to return cached data if available
      if (context) {
        const cachedData = OfflineStorage.getCachedData(context)
        if (cachedData) {
          console.info(`Returning cached data for ${context}`)
          return cachedData
        }
      }
      throw error
    }
  },

  async post(path: string, data?: unknown, context?: string) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      })
      if (!response.ok) throw new Error(`API error: ${response.statusText}`)
      const responseData = await response.json()

      // Cache successful responses for offline use
      if (context) {
        OfflineStorage.cacheData(context, responseData)
      }

      return responseData
    } catch (error) {
      // Try to return cached data if available
      if (context) {
        const cachedData = OfflineStorage.getCachedData(context)
        if (cachedData) {
          console.info(`Returning cached data for ${context}`)
          return cachedData
        }
      }
      throw error
    }
  },
}

// Helper functions for convenience
export const apiFetch = (path: string) => api.get(path)
export const apiPost = (path: string, data?: unknown) => api.post(path, data)

// Download utility for CSV/JSON exports
export const downloadFile = async (path: string, defaultFilename: string) => {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`)

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get('Content-Disposition')
  let filename = defaultFilename
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
    if (filenameMatch) filename = filenameMatch[1]
  }

  // Get blob and trigger download
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// API endpoints
export const endpoints = {
  healthCheck: () => api.get('/healthz', 'health'),
  solarForecast: () => api.get('/forecast/solar', 'solar-forecast'),
  greenWindows: () => api.get('/forecast/green-windows', 'green-windows'),
  saltState: () => api.get('/salt/state', 'salt-state'),
  dispatchPlan: () => api.post('/dispatch/plan', undefined, 'dispatch-plan'),
  algaeTelemetry: (hours = 24) => api.get(`/algae/telemetry?hours=${hours}`, 'algae-telemetry'),
  carbonLedger: () => api.get('/carbon/ledger', 'carbon-ledger'),
  switchScenario: (type: string) => api.post(`/admin/scenario?type=${type}`, { type }, 'scenario-switch'),
  demoBigData: (points = 100000, type = 'solar', hours = 72) =>
    api.get(`/demo/big?points=${points}&type=${type}&hours=${hours}`, 'demo-big-data'),
}
