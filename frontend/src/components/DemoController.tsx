import { useState } from 'react'
import { useDemoScript } from '../hooks/useDemoScript'

interface DemoControllerProps {
  isOpen: boolean
  onClose: () => void
}

export default function DemoController({ isOpen, onClose }: DemoControllerProps) {
  const {
    isRunning,
    currentStep,
    currentStepIndex,
    progress,
    startDemo,
    stopDemo,
    nextStep,
    previousStep,
    goToStep
  } = useDemoScript()

  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')

  if (!isOpen) return null

  const getSpeedMultiplier = () => {
    switch (speed) {
      case 'slow': return 1.5
      case 'fast': return 0.5
      default: return 1
    }
  }

  const adjustedDuration = currentStep ? Math.round(currentStep.duration * getSpeedMultiplier()) : 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-2xl w-full rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary-400">🎭 Demo Controller</h2>
            <p className="text-slate-400 text-sm mt-1">Automated CarbonFlux walkthrough</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{currentStepIndex + 1} / {demoSteps.length}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step Info */}
        {currentStep && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                <span className="text-primary-400 font-bold text-sm">
                  {currentStepIndex + 1}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-200 mb-1">
                  {currentStep.title}
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  {currentStep.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Duration: {adjustedDuration}s</span>
                  {currentStep.page && (
                    <span>Page: {currentStep.page}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Speed Control */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Demo Speed
          </label>
          <div className="flex gap-2">
            {[
              { key: 'slow', label: '🐌 Slow', multiplier: '1.5x' },
              { key: 'normal', label: '🚶 Normal', multiplier: '1x' },
              { key: 'fast', label: '🏃 Fast', multiplier: '0.5x' }
            ].map(({ key, label, multiplier }) => (
              <button
                key={key}
                onClick={() => setSpeed(key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  speed === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {label} ({multiplier})
              </button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          {!isRunning ? (
            <button
              onClick={startDemo}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg
                       font-medium transition-colors flex items-center gap-2"
            >
              <span>▶️</span>
              Start Demo
            </button>
          ) : (
            <button
              onClick={stopDemo}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg
                       font-medium transition-colors flex items-center gap-2"
            >
              <span>⏹️</span>
              Stop Demo
            </button>
          )}

          <button
            onClick={previousStep}
            disabled={currentStepIndex === 0}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800
                     disabled:opacity-50 text-slate-200 rounded-lg font-medium
                     transition-colors flex items-center gap-2"
          >
            <span>⬅️</span>
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={currentStepIndex >= demoSteps.length - 1}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800
                     disabled:opacity-50 text-slate-200 rounded-lg font-medium
                     transition-colors flex items-center gap-2"
          >
            <span>➡️</span>
            Next
          </button>
        </div>

        {/* Step Navigation */}
        <div className="mt-6">
          <div className="grid grid-cols-5 gap-2">
            {demoSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  index === currentStepIndex
                    ? 'bg-primary-600 text-white'
                    : index < currentStepIndex
                    ? 'bg-green-600/20 text-green-400 border border-green-600/40'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
                title={step.title}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo steps data (keeping it here for the component)
const demoSteps = [
  { id: 'start', title: 'Start' },
  { id: 'overview', title: 'Overview' },
  { id: 'cloudy', title: 'Cloudy' },
  { id: 'thermal', title: 'Thermal' },
  { id: 'forecast', title: 'Forecast' },
  { id: 'reactor', title: 'Reactor' },
  { id: 'degas', title: 'Degas' },
  { id: 'carbon', title: 'Carbon' },
  { id: 'export', title: 'Export' },
  { id: 'finish', title: 'Finish' }
]