"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { MetricCard } from "@/lib/components/MetricCard";
import { JourneysChart } from "./_components/JourneysChart";
import { useSites, useJourneys } from "@/lib/hooks";
import { Skeleton } from "@ui/skeleton";
import { Users, Clock, FileText, TrendingUp, Target } from "lucide-react";

export default function JourneysPage() {
  const { data: sites, isLoading: sitesLoading } = useSites();
  const firstSite = sites?.[0];

  const { data, isLoading: dataLoading } = useJourneys(
    firstSite?.siteKey || ""
  );

  const isLoading = sitesLoading || dataLoading;

  // Extract metrics from actual backend response
  const pageDepthDist = data?.pageDepth || [];
  const timeDist = data?.timeOnPage || [];
  const scrollDist = data?.scrollDepth || [];
  const visitorTypes = data?.visitorType || [];

  // Calculate metrics from available data
  const totalPageViews = pageDepthDist.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const avgPageDepth =
    totalPageViews > 0
      ? (
          pageDepthDist.reduce(
            (sum, item) => sum + item.depth * item.count,
            0
          ) / totalPageViews
        ).toFixed(1)
      : "0";

  const totalTimeViews = timeDist.reduce((sum, item) => sum + item.count, 0);
  const returningVisitors =
    visitorTypes.find((v) => v.type === "returning")?.count || 0;
  const newVisitors = visitorTypes.find((v) => v.type === "new")?.count || 0;
  const totalVisitors = returningVisitors + newVisitors;
  const returningPercentage =
    totalVisitors > 0
      ? ((returningVisitors / totalVisitors) * 100).toFixed(1)
      : "0";

  // Format time on site
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Jornadas de Usuários</h1>
        <p className="text-muted-foreground">
          Análise de comportamento e navegação dos visitantes
        </p>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Sessões"
          value={totalPageViews > 0 ? totalPageViews.toLocaleString() : "N/A"}
          description={`${totalVisitors} usuários únicos`}
          icon={Users}
        />

        <MetricCard
          title="Páginas por Sessão"
          value={avgPageDepth !== "0" ? avgPageDepth : "N/A"}
          description="Média de páginas visitadas"
          icon={FileText}
        />

        <MetricCard
          title="Tempo Médio no Site"
          value={totalTimeViews > 0 ? "Disponível" : "N/A"}
          description="Duração média da sessão"
          icon={Clock}
        />

        <MetricCard
          title="Taxa de Rejeição"
          value="N/A"
          description="Dados não disponíveis"
          icon={Target}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page depth distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Profundidade</CardTitle>
          </CardHeader>
          <CardContent>
            <JourneysChart
              data={pageDepthDist.map((item) => ({
                name: `${item.depth} páginas`,
                value: item.count,
              }))}
              title="Distribuição de Profundidade"
            />
          </CardContent>
        </Card>

        {/* Time distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tempo no Site</CardTitle>
          </CardHeader>
          <CardContent>
            <JourneysChart
              data={timeDist.map((item) => ({
                name: item.range,
                value: item.count,
              }))}
              title="Distribuição de Tempo no Site"
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visitantes Retornantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {returningPercentage !== "0" ? `${returningPercentage}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalVisitors > 0
                ? "De todos os visitantes"
                : "Aguardando dados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hard Bounces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">
              1 página + menos de 10s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Exits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menos de 30s + scroll baixo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
