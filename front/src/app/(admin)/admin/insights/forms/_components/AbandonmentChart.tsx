'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart'
import type { FormAbandonmentResponse } from '@/lib/types/insights'

interface AbandonmentChartProps {
  data: FormAbandonmentResponse | undefined
  isLoading?: boolean
}

const chartConfig = {
  count: {
    label: 'Abandonos',
    color: 'hsl(var(--chart-1))',
  },
}

export function AbandonmentChart({
  data,
  isLoading,
}: AbandonmentChartProps) {
  if (isLoading || !data || !data.abandonmentsByStage.length) {
    return (
      <div className="flex h-auto items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Carregando dados...' : 'Sem dados disponíveis'}
        </p>
      </div>
    )
  }

  const chartData = data.abandonmentsByStage.map((item) => ({
    stage: item.stage,
    count: item.count,
    percentage: item.percentage,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


