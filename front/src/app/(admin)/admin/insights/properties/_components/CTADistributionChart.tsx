'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart'
import type { PropertyEngagementResponse } from '@/lib/types/insights'

interface CTADistributionChartProps {
  data: PropertyEngagementResponse | undefined
  isLoading?: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
]

const chartConfig = {
  clicks: {
    label: 'Cliques',
  },
}

export function CTADistributionChart({
  data,
  isLoading,
}: CTADistributionChartProps) {
  if (isLoading || !data) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Carregando dados...' : 'Sem dados disponíveis'}
        </p>
      </div>
    )
  }

  const chartData = [
    {
      name: 'Fazer Proposta',
      value: data.ctaPerformance.fazerProposta,
    },
    {
      name: 'Alugar Imóvel',
      value: data.ctaPerformance.alugarImovel,
    },
    {
      name: 'Mais Informações',
      value: data.ctaPerformance.maisInformacoes,
    },
  ].filter((item) => item.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
      </div>
    )
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => {
              const percentage = ((value / total) * 100).toFixed(1)
              return `${name}: ${percentage}%`
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


