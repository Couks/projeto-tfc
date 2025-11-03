'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { useSites } from '../hooks'

interface SiteContextValue {
  selectedSiteKey: string | undefined
  setSelectedSiteKey: (key: string) => void
  isLoading: boolean
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined)

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { data: sites, isLoading } = useSites()
  const [selectedSiteKey, setSelectedSiteKey] = useState<string | undefined>(
    undefined
  )

  const value = useMemo<SiteContextValue>(
    () => ({ selectedSiteKey, setSelectedSiteKey, isLoading }),
    [selectedSiteKey, isLoading]
  )

  // Auto-select first site when loaded and nothing selected
  if (!isLoading && !selectedSiteKey && sites && sites.length > 0) {
    // set synchronously is fine in client component render as it will schedule update
    setSelectedSiteKey(sites[0].siteKey)
  }

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSiteContext(): SiteContextValue {
  const ctx = useContext(SiteContext)
  if (!ctx) {
    throw new Error('useSiteContext must be used within a SiteProvider')
  }
  return ctx
}
