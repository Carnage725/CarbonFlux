const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const api = {
  async get(path: string) {
    const response = await fetch(`${API_BASE}${path}`)
    if (!response.ok) throw new Error(`API error: ${response.statusText}`)
    return response.json()
  },

  async post(path: string, data?: unknown) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) throw new Error(`API error: ${response.statusText}`)
    return response.json()
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
  healthCheck: () => api.get('/healthz'),
  solarForecast: () => api.get('/forecast/solar'),
  greenWindows: () => api.get('/forecast/green-windows'),
  saltState: () => api.get('/salt/state'),
  dispatchPlan: () => api.post('/dispatch/plan'),
  algaeTelemetry: (hours = 24) => api.get(`/algae/telemetry?hours=${hours}`),
  carbonLedger: () => api.get('/carbon/ledger'),
  switchScenario: (type: string) => api.post(`/admin/scenario?type=${type}`),
}
