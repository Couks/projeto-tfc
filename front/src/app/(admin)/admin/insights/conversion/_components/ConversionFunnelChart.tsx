'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart'
import type { ConversionFunnelResponse } from '@/lib/types/insights'

interface ConversionFunnelChartProps {
  data: ConversionFunnelResponse | undefined
  isLoading?: boolean
}

const chartConfig = {
  count: {
    label: 'Usuários',
    color: 'hsl(var(--chart-1))',
  },
}

export function ConversionFunnelChart({
  data,
  isLoading,
}: ConversionFunnelChartProps) {
  if (isLoading || !data) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando dados...</p>
      </div>
    )
  }

  const chartData = data.stages.map((stage) => ({
    stage: stage.stage,
    count: stage.count,
    percentage: stage.percentage,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="stage" type="category" width={100} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


