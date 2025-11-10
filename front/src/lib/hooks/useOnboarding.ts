import { useState, useEffect } from 'react'

const ONBOARDING_KEY = 'insighthouse_onboarding_completed'

// Check onboarding status outside of component to avoid SSR issues
const getOnboardingStatus = () => {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState<boolean>(getOnboardingStatus)

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsCompleted(true)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY)
    setIsCompleted(false)
  }

  return {
    isCompleted,
    completeOnboarding,
    resetOnboarding,
  }
}

