'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const purposesData = [
  { name: 'Venda', value: 68.5, color: 'hsl(var(--primary))' },
  { name: 'Locação', value: 28.3, color: 'hsl(var(--secondary))' },
  { name: 'Temporada', value: 3.2, color: 'hsl(var(--accent))' },
];

const chartConfig = {
  value: {
    label: 'Percentual',
  },
};

export function PurposesChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <Pie
          data={purposesData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {purposesData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}
