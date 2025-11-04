'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@ui/skeleton'
import { useSites } from '@/lib/hooks'
import { useSearchAnalytics } from '@/lib/hooks/useInsights'

const chartConfig = {
  searches: {
    label: 'Pesquisas',
    color: 'hsl(var(--primary))',
  },
}

export function CitiesChart() {
  const { data: sites } = useSites()
  const firstSite = sites?.[0]
  const {
    data: searchData,
    isLoading,
    error,
  } = useSearchAnalytics(firstSite?.siteKey || '')

  // Transform search analytics data to chart format
  const citiesData =
    searchData?.topCidades.map((item) => ({
      city: item.cidade,
      searches: item.count,
    })) || []

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

  if (error || citiesData.length === 0) {
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
      <BarChart data={citiesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="city"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="searches" fill="var(--color-searches)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
