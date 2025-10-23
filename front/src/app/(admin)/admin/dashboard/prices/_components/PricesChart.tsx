'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@ui/skeleton";
import { useSites, usePrices } from "@/lib/hooks";

const chartConfig = {
  searches: {
    label: "Pesquisas",
    color: "hsl(var(--primary))",
  },
};

export function PricesChart() {
  const { data: sites } = useSites();
  const firstSite = sites?.[0];
  const {
    data: pricesData,
    isLoading,
    error,
  } = usePrices(firstSite?.siteKey || "");

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

  if (error || pricesData.length === 0) {
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
        <Bar dataKey="searches" fill="var(--color-searches)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
