import { useState, useEffect } from 'react'
import { apiFetch, downloadFile } from '../lib/api'
import CumulativeCO2Chart from '../components/CumulativeCO2Chart'
import DailyCO2BarChart from '../components/DailyCO2BarChart'

interface DailyLedgerPoint {
  day: string
  total_co2_in_kg: number
  total_co2_fixed_kg: number
  total_co2_net_kg: number
  records: number
}

interface CarbonLedgerResponse {
  daily: DailyLedgerPoint[]
  cumulative_net_kg: number
  total_days: number
}

export default function Carbon() {
  const [ledgerData, setLedgerData] = useState<CarbonLedgerResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingCSV, setDownloadingCSV] = useState(false)
  const [downloadingJSON, setDownloadingJSON] = useState(false)
  const [mintingCredit, setMintingCredit] = useState(false)

  useEffect(() => {
    apiFetch('/carbon/ledger')
      .then((data) => {
        setLedgerData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch carbon ledger:', error)
        setLoading(false)
      })
  }, [])

  const handleExportCSV = async () => {
    setDownloadingCSV(true)
    try {
      await downloadFile('/carbon/ledger?export=csv', 'carbon_ledger.csv')
    } catch (error) {
      console.error('CSV download failed:', error)
    } finally {
      setDownloadingCSV(false)
    }
  }

  const handleExportJSON = async () => {
    setDownloadingJSON(true)
    try {
      await downloadFile('/carbon/ledger?export=json', 'carbon_ledger.json')
    } catch (error) {
      console.error('JSON download failed:', error)
    } finally {
      setDownloadingJSON(false)
    }
  }

  const handleMintCredit = async () => {
    setMintingCredit(true)
    try {
      // Download JSON with special formatting for "demo credit"
      await downloadFile('/carbon/ledger?export=json', 'carbon_credit_audit.json')

      // Show success animation
      setTimeout(() => {
        setMintingCredit(false)
      }, 2000)
    } catch (error) {
      console.error('Mint credit failed:', error)
      setMintingCredit(false)
    }
  }

  // Calculate totals
  const totalCO2In = ledgerData?.daily.reduce((sum, d) => sum + d.total_co2_in_kg, 0) || 0
  const totalCO2Fixed = ledgerData?.daily.reduce((sum, d) => sum + d.total_co2_fixed_kg, 0) || 0
  const totalCO2Net = ledgerData?.cumulative_net_kg || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Carbon & Exports</h2>
        <p className="text-slate-400 mt-2">
          Carbon capture ledger and audit artifacts
        </p>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2 text-slate-300">Total CO₂ In</h3>
          <div className="text-3xl font-bold text-slate-200">
            {loading ? '—' : totalCO2In.toFixed(0)} kg
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {loading ? '—' : `${ledgerData?.total_days || 0} days tracked`}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2 text-slate-300">Total CO₂ Fixed</h3>
          <div className="text-3xl font-bold text-cyan-400">
            {loading ? '—' : totalCO2Fixed.toFixed(0)} kg
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {loading ? '—' : `${((totalCO2Fixed / totalCO2In) * 100).toFixed(1)}% conversion rate`}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-2 text-slate-300">Net Captured</h3>
          <div className="text-3xl font-bold text-emerald-400">
            {loading ? '—' : totalCO2Net.toFixed(0)} kg
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {loading ? '—' : `${(totalCO2Net / 1000).toFixed(2)} metric tons`}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold">Carbon Capture Trends</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              disabled={downloadingCSV || loading}
              className="glass-button text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-colors"
            >
              {downloadingCSV ? '⏳ Downloading...' : '📄 Export CSV'}
            </button>
            <button
              onClick={handleExportJSON}
              disabled={downloadingJSON || loading}
              className="glass-button text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-colors"
            >
              {downloadingJSON ? '⏳ Downloading...' : '📋 Export JSON'}
            </button>
            <button
              onClick={handleMintCredit}
              disabled={mintingCredit || loading}
              className={`
                glass-button text-sm px-4 py-2
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-gradient-to-r from-emerald-500/20 to-cyan-500/20
                border-emerald-500/40 hover:from-emerald-500/30 hover:to-cyan-500/30
                transition-all duration-300
                ${mintingCredit ? 'animate-pulse scale-105' : ''}
              `}
            >
              {mintingCredit ? '✨ Minting...' : '🪙 Mint Demo Credit'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-slate-500">
            Loading carbon ledger data...
          </div>
        ) : ledgerData && ledgerData.daily.length > 0 ? (
          <div className="space-y-8">
            <CumulativeCO2Chart data={ledgerData.daily} />
            <DailyCO2BarChart data={ledgerData.daily} />
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-slate-500">
            No carbon ledger data available
          </div>
        )}
      </div>

      {mintingCredit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border-2 border-emerald-500 rounded-xl p-8 text-center animate-pulse">
            <div className="text-6xl mb-4">✨</div>
            <div className="text-2xl font-bold text-emerald-400 mb-2">Demo Credit Minted!</div>
            <div className="text-slate-400">Audit artifact downloaded</div>
          </div>
        </div>
      )}
    </div>
  )
}
