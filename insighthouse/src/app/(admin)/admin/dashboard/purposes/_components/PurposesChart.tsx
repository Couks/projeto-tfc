'use client';

import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@ui/skeleton";

interface PurposeData {
  name: string;
  value: number;
  color: string;
}

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
  const [purposesData, setPurposesData] = useState<PurposeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const sitesRes = await fetch("/api/sites");
        if (!sitesRes.ok) throw new Error("Failed to fetch sites");

        const sites = await sitesRes.json();
        const firstSite = sites[0];

        if (!firstSite) {
          setPurposesData([]);
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `/api/insights/overview?site=${encodeURIComponent(firstSite.siteKey)}`
        );
        if (!res.ok) throw new Error("Failed to fetch insights");

        const data = await res.json();

        // Transform data for chart
        const transformed: PurposeData[] = (data.finalidade || []).map(
          (item: any[], index: number) => ({
            name: item[0] || "Unknown",
            value: parseInt(item[1]) || 0,
            color: COLORS[index % COLORS.length],
          })
        );

        setPurposesData(transformed);
      } catch (err) {
        console.error("Error fetching purposes data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

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

  if (error || purposesData.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {error ||
            "Nenhum dado disponível. Configure um site e aguarde dados de pesquisa."}
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <Pie
          data={purposesData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} (${value})`}
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
