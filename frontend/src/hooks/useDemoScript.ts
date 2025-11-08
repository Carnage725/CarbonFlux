import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { endpoints } from '../lib/api'

interface DemoStep {
  id: string
  title: string
  description: string
  action: () => Promise<void>
  duration: number // seconds
  page?: string // navigate to page
  highlight?: string // element to highlight
}

const demoSteps: DemoStep[] = [
  {
    id: 'start',
    title: 'Starting Demo',
    description: 'Setting up Clear Sky conditions for optimal performance',
    action: async () => {
      await endpoints.switchScenario('clear')
    },
    duration: 5,
    page: '/'
  },
  {
    id: 'overview',
    title: 'System Overview',
    description: 'Real-time energy flow: Solar → Storage → Algae bioreactor',
    action: async () => {
      // Just wait and observe
      await new Promise(resolve => setTimeout(resolve, 100))
    },
    duration: 10,
    page: '/',
    highlight: 'overview-metrics'
  },
  {
    id: 'cloudy',
    title: 'Weather Impact',
    description: 'Switching to cloudy conditions - watch the system adapt automatically',
    action: async () => {
      await endpoints.switchScenario('cloudy')
    },
    duration: 15,
    page: '/',
    highlight: 'scenario-switcher'
  },
  {
    id: 'thermal',
    title: 'Thermal Storage',
    description: 'Examining molten-salt battery performance and heat loss',
    action: async () => {
      // Just navigate and observe
      await new Promise(resolve => setTimeout(resolve, 100))
    },
    duration: 10,
    page: '/thermal',
    highlight: 'thermal-charts'
  },
  {
    id: 'forecast',
    title: 'Forecast Lab',
    description: 'Interactive solar forecasting with uncertainty bands',
    action: async () => {
      // Just navigate and observe
      await new Promise(resolve => setTimeout(resolve, 100))
    },
    duration: 8,
    page: '/forecast',
    highlight: 'forecast-chart'
  },
  {
    id: 'reactor',
    title: 'Bioreactor Console',
    description: 'Live algae telemetry and control systems',
    action: async () => {
      // Just navigate and observe
      await new Promise(resolve => setTimeout(resolve, 100))
    },
    duration: 5,
    page: '/reactor',
    highlight: 'telemetry-charts'
  },
  {
    id: 'degas',
    title: 'Control Action',
    description: 'Triggering "Degas Now" to reduce dissolved oxygen',
    action: async () => {
      // This would trigger a control action - for demo we'll simulate
      console.log('Demo: Triggering degas action')
      await new Promise(resolve => setTimeout(resolve, 2000))
    },
    duration: 8,
    page: '/reactor',
    highlight: 'control-buttons'
  },
  {
    id: 'carbon',
    title: 'Carbon Accounting',
    description: 'Audit trail of CO₂ capture and carbon credits',
    action: async () => {
      // Just navigate and observe
      await new Promise(resolve => setTimeout(resolve, 100))
    },
    duration: 5,
    page: '/carbon',
    highlight: 'carbon-charts'
  },
  {
    id: 'export',
    title: 'Data Export',
    description: 'Exporting carbon ledger for verification and compliance',
    action: async () => {
      // This would trigger an export - for demo we'll simulate
      console.log('Demo: Triggering JSON export')
      await new Promise(resolve => setTimeout(resolve, 3000))
    },
    duration: 5,
    page: '/carbon',
    highlight: 'export-buttons'
  },
  {
    id: 'finish',
    title: 'Demo Complete',
    description: 'CarbonFlux demonstrates integrated renewable energy orchestration',
    action: async () => {
      // Return to overview
      await new Promise(resolve => setTimeout(resolve, 100))
    },
    duration: 5,
    page: '/',
    highlight: 'overview-metrics'
  }
]

interface UseDemoScriptReturn {
  isRunning: boolean
  currentStep: DemoStep | null
  currentStepIndex: number
  progress: number
  startDemo: () => void
  stopDemo: () => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (index: number) => void
}

export function useDemoScript(): UseDemoScriptReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepTimeout, setStepTimeout] = useState<number | null>(null)
  const navigate = useNavigate()

  const currentStep = demoSteps[currentStepIndex] || null
  const progress = ((currentStepIndex + 1) / demoSteps.length) * 100

  const executeStep = useCallback(async (step: DemoStep) => {
    try {
      // Navigate to the correct page if specified
      if (step.page) {
        navigate(step.page)
        // Wait a bit for navigation
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Execute the step action
      await step.action()

      // Auto-advance after the step duration
      if (isRunning && currentStepIndex < demoSteps.length - 1) {
        const timeout = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1)
        }, step.duration * 1000)
        setStepTimeout(timeout)
      } else if (currentStepIndex >= demoSteps.length - 1) {
        // Demo finished
        setIsRunning(false)
      }
    } catch (error) {
      console.error('Demo step failed:', error)
      setIsRunning(false)
    }
  }, [isRunning, currentStepIndex, navigate])

  const startDemo = useCallback(() => {
    setIsRunning(true)
    setCurrentStepIndex(0)
  }, [])

  const stopDemo = useCallback(() => {
    setIsRunning(false)
    if (stepTimeout) {
      clearTimeout(stepTimeout)
      setStepTimeout(null)
    }
  }, [stepTimeout])

  const nextStep = useCallback(() => {
    if (stepTimeout) {
      clearTimeout(stepTimeout)
    }
    if (currentStepIndex < demoSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      setIsRunning(false)
    }
  }, [currentStepIndex, stepTimeout])

  const previousStep = useCallback(() => {
    if (stepTimeout) {
      clearTimeout(stepTimeout)
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex, stepTimeout])

  const goToStep = useCallback((index: number) => {
    if (stepTimeout) {
      clearTimeout(stepTimeout)
    }
    if (index >= 0 && index < demoSteps.length) {
      setCurrentStepIndex(index)
    }
  }, [stepTimeout])

  // Execute current step when it changes
  useEffect(() => {
    if (isRunning && currentStep) {
      executeStep(currentStep)
    }
  }, [isRunning, currentStep, executeStep])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepTimeout) {
        clearTimeout(stepTimeout)
      }
    }
  }, [stepTimeout])

  return {
    isRunning,
    currentStep,
    currentStepIndex,
    progress,
    startDemo,
    stopDemo,
    nextStep,
    previousStep,
    goToStep
  }
}