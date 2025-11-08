import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import ThermalTwin from './pages/ThermalTwin'
import ForecastLab from './pages/ForecastLab'
import ReactorConsole from './pages/ReactorConsole'
import Carbon from './pages/Carbon'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors, but retry on network errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Overview />} />
                <Route path="thermal" element={<ThermalTwin />} />
                <Route path="forecast" element={<ForecastLab />} />
                <Route path="reactor" element={<ReactorConsole />} />
                <Route path="carbon" element={<Carbon />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
