'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const typesData = [
  { name: 'Apartamentos', value: 45.2, color: 'hsl(var(--primary))' },
  { name: 'Casas', value: 32.8, color: 'hsl(var(--secondary))' },
  { name: 'Comerciais', value: 22.0, color: 'hsl(var(--accent))' },
];

const chartConfig = {
  value: {
    label: 'Percentual',
  },
};

export function TypesChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <Pie
          data={typesData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {typesData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}
