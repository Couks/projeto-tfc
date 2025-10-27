"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { TypesChart } from "./_components/TypesChart";
import { useSites, useTypes } from "@/lib/hooks";
import { Skeleton } from "@ui/skeleton";

export default function TypesPage() {
  const { data: sites, isLoading: sitesLoading } = useSites();
  const firstSite = sites?.[0];

  const { data, isLoading: dataLoading } = useTypes(firstSite?.siteKey || "");

  const isLoading = sitesLoading || dataLoading;

  // Calculate metrics from real data
  const totalSearches =
    data?.reduce((sum: number, item) => sum + item.value, 0) || 0;

  // Get top 3 types
  const topTypes = data?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tipos de Imóveis</h1>
        <p className="text-muted-foreground">
          Tipos de imóveis mais buscados pelos usuários
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <TypesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topTypes.map((type, index: number) => {
            const typeName = type.name || "N/A";
            const typeCount = type.value || 0;
            const typePercentage =
              totalSearches > 0
                ? ((typeCount / totalSearches) * 100).toFixed(1)
                : "0";

            const labels = [
              "mais buscado",
              "segundo mais buscado",
              "terceiro mais buscado",
            ];

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{typeName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(typePercentage) > 0
                      ? `${typePercentage}%`
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {typeCount > 0
                      ? `${labels[index]} (${typeCount} pesquisas)`
                      : "Aguardando dados"}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* Fill with empty cards if less than 3 types */}
          {Array.from({ length: Math.max(0, 3 - topTypes.length) }).map(
            (_, i) => (
              <Card key={`empty-${i}`}>
                <CardHeader>
                  <CardTitle className="text-base">-</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando dados
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}
