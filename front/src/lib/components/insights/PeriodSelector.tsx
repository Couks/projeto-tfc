'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/popover'
import { Calendar } from '@ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select'
import { cn } from 'src/utils/utils'

interface PeriodSelectorProps {
  onPeriodChange?: (start: Date, end: Date) => void
}

const presetPeriods = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Personalizado', days: 0 },
]

export function PeriodSelector({ onPeriodChange }: PeriodSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState('30')
  const [customStart, setCustomStart] = useState<Date>()
  const [customEnd, setCustomEnd] = useState<Date>()
  const [showCustom, setShowCustom] = useState(false)

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)

    if (value === '0') {
      setShowCustom(true)
      return
    }

    setShowCustom(false)
    const days = parseInt(value)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    onPeriodChange?.(start, end)
  }

  const handleCustomDateChange = () => {
    if (customStart && customEnd && onPeriodChange) {
      onPeriodChange(customStart, customEnd)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          {presetPeriods.map((period) => (
            <SelectItem key={period.days} value={String(period.days)}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !customStart && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStart ? format(customStart, 'PPP') : 'Data inicial'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customStart}
                onSelect={setCustomStart}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !customEnd && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customEnd ? format(customEnd, 'PPP') : 'Data final'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customEnd}
                onSelect={setCustomEnd}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleCustomDateChange}
            disabled={!customStart || !customEnd}
          >
            Aplicar
          </Button>
        </>
      )}
    </div>
  )
}

