'use client'

import { Spinner } from '@ui/spinner'
import { Skeleton } from '@ui/skeleton'
import type { TopConvertingFiltersResponse } from '@/lib/types/insights'

interface TopConvertingFiltersTableProps {
  data: TopConvertingFiltersResponse | undefined
  isLoading: boolean
}

export function TopConvertingFiltersTable({
  data,
  isLoading,
}: TopConvertingFiltersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!data?.filters || data.filters.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Sem dados de filtros que convertem disponíveis para o período
        selecionado.
      </p>
    )
  }

  const formatFilterCombination = (
    combination: Record<string, string | string[]>
  ): string => {
    const parts: string[] = []
    for (const [key, value] of Object.entries(combination)) {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            parts.push(`${key}: ${value.join(', ')}`)
          }
        } else {
          parts.push(`${key}: ${value}`)
        }
      }
    }
    return parts.join(' | ')
  }

  return (
    <div className="space-y-3">
      {data.filters.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm break-words">
                {formatFilterCombination(item.combination)}
              </p>
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="font-bold text-lg">
              {item.conversions.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">conversões</p>
          </div>
        </div>
      ))}
    </div>
  )
}
