'use client'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { Skeleton } from '@ui/skeleton'
import { useSites } from '@/lib/hooks'
import { useSearchAnalytics } from '@/lib/hooks/useInsights'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
]

const chartConfig = {
  value: {
    label: 'Pesquisas',
  },
}

export function TypesChart() {
  const { data: sites } = useSites()
  const firstSite = sites?.[0]
  const {
    data: searchData,
    isLoading,
    error,
  } = useSearchAnalytics(firstSite?.siteKey || '')

  // Transform search analytics data to chart format
  const typesData =
    searchData?.topTipos.map((item) => ({
      name: item.tipo,
      value: item.count,
    })) || []

  // Add colors to the data
  const typesDataWithColors = typesData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }))

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[180px]" />
        </div>
      </div>
    )
  }

  if (error || typesDataWithColors.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {error?.message ||
            'Nenhum dado disponível. Configure um site e aguarde dados de pesquisa.'}
        </p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <Pie
          data={typesDataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} (${value})`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {typesDataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}
