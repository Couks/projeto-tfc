'use client';

import { useEffect, useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@ui/skeleton";

interface CityData {
  city: string;
  searches: number;
}

const chartConfig = {
  searches: {
    label: "Pesquisas",
    color: "hsl(var(--primary))",
  },
};

export function CitiesChart() {
  const [citiesData, setCitiesData] = useState<CityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Fetch site data first
        const sitesRes = await fetch("/api/sites");
        if (!sitesRes.ok) throw new Error("Failed to fetch sites");

        const sitesData = await sitesRes.json();
        // Get first site's siteKey - in a real app, might want to let user select
        const firstSite = sitesData[0];

        if (!firstSite) {
          setCitiesData([]);
          setIsLoading(false);
          return;
        }

        // Fetch insights data
        const res = await fetch(
          `/api/insights/overview?site=${encodeURIComponent(firstSite.siteKey)}`
        );
        if (!res.ok) throw new Error("Failed to fetch insights");

        const data = await res.json();

        // Transform data for chart
        const transformed: CityData[] = (data.cidades || []).map(
          (item: any[]) => ({
            city: item[0] || "Unknown",
            searches: parseInt(item[1]) || 0,
          })
        );

        setCitiesData(transformed);
      } catch (err) {
        console.error("Error fetching cities data:", err);
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

  if (error || citiesData.length === 0) {
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
