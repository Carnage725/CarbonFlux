import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import ThermalTwin from './pages/ThermalTwin'
import ForecastLab from './pages/ForecastLab'
import ReactorConsole from './pages/ReactorConsole'
import Carbon from './pages/Carbon'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="thermal" element={<ThermalTwin />} />
            <Route path="forecast" element={<ForecastLab />} />
            <Route path="reactor" element={<ReactorConsole />} />
            <Route path="carbon" element={<Carbon />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
