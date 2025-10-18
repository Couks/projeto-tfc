'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface CTAData {
  cta: string;
  clicks: number;
}

interface CTAPerformanceChartProps {
  data: CTAData[];
}

export function CTAPerformanceChart({ data }: CTAPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Nenhum dado disponível
        </p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        clicks: {
          label: "Cliques",
          color: "hsl(var(--primary))",
        },
      }}
      className="h-[300px] w-full"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="cta" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
