'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { OnboardingDialog } from './_components/OnboardingDialog'

export default function AdminHome() {
  const router = useRouter()
  const { isCompleted, completeOnboarding } = useOnboarding()

  // Redirect to insights if onboarding is completed
  useEffect(() => {
    if (isCompleted) {
      router.push('/admin/insights')
    }
  }, [isCompleted, router])

  // Show onboarding for first-time users
  return (
    <OnboardingDialog open={!isCompleted} onComplete={completeOnboarding} />
  )
}
