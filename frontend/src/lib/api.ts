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
