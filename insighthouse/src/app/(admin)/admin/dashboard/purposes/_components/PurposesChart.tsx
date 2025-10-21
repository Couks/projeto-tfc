'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@ui/skeleton";
import { useSites, usePurposes } from "@/lib/hooks";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
];

const chartConfig = {
  value: {
    label: "Pesquisas",
  },
};

export function PurposesChart() {
  const { data: sites } = useSites();
  const firstSite = sites?.[0];
  const {
    data: purposesData,
    isLoading,
    error,
  } = usePurposes(firstSite?.siteKey || "");

  // Add colors to the data
  const purposesDataWithColors = purposesData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[180px]" />
        </div>
      </div>
    );
  }

  if (error || purposesDataWithColors.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {error?.message ||
            "Nenhum dado disponível. Configure um site e aguarde dados de pesquisa."}
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <Pie
          data={purposesDataWithColors}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} (${value})`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {purposesDataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}
