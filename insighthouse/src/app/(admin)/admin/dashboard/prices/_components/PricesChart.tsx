'use client';

import { useEffect, useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@ui/skeleton";

interface PriceData {
  range: string;
  searches: number;
}

const chartConfig = {
  searches: {
    label: "Pesquisas",
    color: "hsl(var(--primary))",
  },
};

export function PricesChart() {
  const [pricesData, setPricesData] = useState<PriceData[]>([]);
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
          setPricesData([]);
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `/api/insights/overview?site=${encodeURIComponent(firstSite.siteKey)}`
        );
        if (!res.ok) throw new Error("Failed to fetch insights");

        const data = await res.json();

        // Transform data for chart (combine sale and rental price ranges)
        const saleRanges = (data.preco_venda_ranges || []).map(
          (item: any[]) => ({
            range: item[0] || "Unknown",
            searches: parseInt(item[1]) || 0,
          })
        );

        const rentalRanges = (data.preco_aluguel_ranges || []).map(
          (item: any[]) => ({
            range: item[0] || "Unknown",
            searches: parseInt(item[1]) || 0,
          })
        );

        // Use sale ranges as primary, can be extended later
        setPricesData(saleRanges);
      } catch (err) {
        console.error("Error fetching prices data:", err);
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

  if (error || pricesData.length === 0) {
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
