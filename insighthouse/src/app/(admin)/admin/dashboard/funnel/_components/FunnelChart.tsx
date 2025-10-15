'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const funnelData = [
  { stage: 'Visitantes', value: 1000, color: 'hsl(var(--primary))' },
  { stage: 'Interessados', value: 450, color: 'hsl(var(--primary))' },
  { stage: 'Contatos', value: 180, color: 'hsl(var(--primary))' },
  { stage: 'Leads', value: 75, color: 'hsl(var(--primary))' },
  { stage: 'Vendas', value: 25, color: 'hsl(var(--primary))' },
];

const chartConfig = {
  value: {
    label: 'Quantidade',
    color: 'hsl(var(--primary))',
  },
};

export function FunnelChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart data={funnelData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="stage" type="category" width={100} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
