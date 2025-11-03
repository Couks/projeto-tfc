'use client'

import { useState, useEffect } from 'react'
import { Button } from '@ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  // Initialize theme from localStorage or system preference
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) return savedTheme
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return prefersDark ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    // Apply theme on mount to ensure DOM is in sync
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    // Theme will be applied by useEffect when theme state changes
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">
              {theme === 'light'
                ? 'Switch to dark mode'
                : 'Switch to light mode'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
