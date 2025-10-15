'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const pricesData = [
  { range: 'Até R$ 100k', percentage: 8.5 },
  { range: 'R$ 100k - R$ 200k', percentage: 18.9 },
  { range: 'R$ 200k - R$ 500k', percentage: 35.2 },
  { range: 'R$ 500k - R$ 1M', percentage: 28.7 },
  { range: 'R$ 1M - R$ 2M', percentage: 6.8 },
  { range: 'Acima de R$ 2M', percentage: 1.9 },
];

const chartConfig = {
  percentage: {
    label: 'Percentual',
    color: 'hsl(var(--primary))',
  },
};

export function PricesChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart data={pricesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="range"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
