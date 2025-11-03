'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface JourneysData {
  name: string
  value: number
}

interface JourneysChartProps {
  data: JourneysData[]
  title: string
  description?: string
}

export function JourneysChart({
  data,
  title,
  description,
}: JourneysChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <ChartContainer
      config={{
        value: {
          label: 'Sessões',
          color: 'hsl(var(--primary))',
        },
      }}
      className="h-[300px] w-full"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
