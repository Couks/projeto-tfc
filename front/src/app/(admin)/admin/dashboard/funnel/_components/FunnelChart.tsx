'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@ui/skeleton'
import { useSites, useFunnel } from '@/lib/hooks'

const chartConfig = {
  value: {
    label: 'Usuários',
    color: 'hsl(var(--primary))',
  },
}

export function FunnelChart() {
  const { data: sites } = useSites()
  const firstSite = sites?.[0]
  const {
    data: funnelData,
    isLoading,
    error,
  } = useFunnel(firstSite?.siteKey || '')

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

  if (error || funnelData.length === 0) {
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
      <BarChart data={funnelData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="stage" type="category" width={150} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
