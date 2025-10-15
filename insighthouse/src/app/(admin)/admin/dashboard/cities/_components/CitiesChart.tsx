'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const citiesData = [
  { city: 'São Paulo', searches: 1234 },
  { city: 'Rio de Janeiro', searches: 987 },
  { city: 'Belo Horizonte', searches: 756 },
  { city: 'Brasília', searches: 654 },
  { city: 'Salvador', searches: 543 },
  { city: 'Fortaleza', searches: 432 },
  { city: 'Manaus', searches: 321 },
  { city: 'Curitiba', searches: 298 },
  { city: 'Recife', searches: 267 },
  { city: 'Porto Alegre', searches: 234 },
];

const chartConfig = {
  searches: {
    label: 'Pesquisas',
    color: 'hsl(var(--primary))',
  },
};

export function CitiesChart() {
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
  );
}
