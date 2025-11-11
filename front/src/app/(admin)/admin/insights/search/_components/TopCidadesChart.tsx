'use client'

import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@ui/chart'
import { Spinner } from '@ui/spinner'
import type { SearchAnalyticsResponse } from '@/lib/types/insights'

interface TopCidadesChartProps {
  data: SearchAnalyticsResponse | undefined
  isLoading?: boolean
}

// Generate chart config dynamically for up to 5 cities
const generateChartConfig = (
  cidades: Array<{ cidade: string }>
): ChartConfig => {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  const config: ChartConfig = {
    count: {
      label: 'Buscas',
    },
  }

  cidades.slice(0, 5).forEach((item, index) => {
    const key = item.cidade.toLowerCase().replace(/\s+/g, '_')
    config[key] = {
      label: item.cidade,
      color: colors[index % colors.length],
    }
  })

  return config
}

export function TopCidadesChart({ data, isLoading }: TopCidadesChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!data || !data.topCidades.length) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
      </div>
    )
  }

  const topCidades = data.topCidades.slice(0, 5)
  const chartConfig = generateChartConfig(topCidades)

  const chartData = topCidades.map((item) => {
    const key = item.cidade.toLowerCase().replace(/\s+/g, '_')
    return {
      cidade: key,
      cidadeLabel: item.cidade,
      count: item.count,
      fill: `var(--color-${key})`,
    }
  })

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
        }}
      >
        <YAxis
          dataKey="cidade"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            chartConfig[value as keyof typeof chartConfig]?.label || value
          }
        />
        <XAxis dataKey="count" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="count" layout="vertical" radius={5} />
      </BarChart>
    </ChartContainer>
  )
}
