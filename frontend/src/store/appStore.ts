import { create } from 'zustand'

interface AppState {
  currentScenario: string
  setScenario: (scenario: string) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentScenario: 'clear',
  setScenario: (scenario) => set({ currentScenario: scenario }),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))
