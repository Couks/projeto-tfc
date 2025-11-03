'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { ChevronRight } from 'lucide-react'

interface FunnelStage {
  name: string
  value: number
  color?: string
}

interface FunnelVisualizationProps {
  stages: FunnelStage[]
  title?: string
  className?: string
}

export function FunnelVisualization({
  stages,
  title = 'Funil de Conversão',
  className,
}: FunnelVisualizationProps) {
  const maxValue = stages[0]?.value || 1

  const calculatePercentage = (value: number) => {
    return ((value / maxValue) * 100).toFixed(1)
  }

  const calculateDropOff = (current: number, previous: number) => {
    if (!previous) return null
    return (((previous - current) / previous) * 100).toFixed(1)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const percentage = calculatePercentage(stage.value)
            const dropOff =
              index > 0
                ? calculateDropOff(stage.value, stages[index - 1].value)
                : null

            return (
              <div key={index}>
                {index > 0 && (
                  <div className="flex items-center justify-center py-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
                    {dropOff && (
                      <span className="text-xs text-red-600 ml-2">
                        -{dropOff}% drop-off
                      </span>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {stage.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: stage.color || 'hsl(var(--primary))',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {stages.length > 1 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Taxa de Conversão Total:</span>
              <span className="text-lg font-bold text-primary">
                {(
                  (stages[stages.length - 1].value / stages[0].value) *
                  100
                ).toFixed(2)}
                %
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

FunnelVisualization.displayName = 'FunnelVisualization'
