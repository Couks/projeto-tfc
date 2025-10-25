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

  // Extract metrics
  const sessionMetrics = data?.session_metrics || {
    total_sessions: 0,
    total_users: 0,
    avg_page_depth: 0,
    avg_time_on_site: 0,
    returning_visitor_percentage: 0,
  };

  const bounceMetrics = data?.bounce_metrics || {
    total_sessions: 0,
    bounced_sessions: 0,
    hard_bounces: 0,
    quick_exits: 0,
    avg_bounce_time: 0,
  };

  const pageDepthDist = data?.page_depth_distribution || [];
  const timeDist = data?.time_distribution || [];
  const landingPages = data?.landing_pages || [];
  const referrers = data?.referrers || [];
  const scrollEngagement = data?.scroll_engagement || [];

  // Calculate bounce rate
  const bounceRate =
    bounceMetrics.total_sessions > 0
      ? (
          (bounceMetrics.bounced_sessions / bounceMetrics.total_sessions) *
          100
        ).toFixed(1)
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
          value={
            sessionMetrics.total_sessions > 0
              ? sessionMetrics.total_sessions.toLocaleString()
              : "N/A"
          }
          description={`${sessionMetrics.total_users} usuários únicos`}
          icon={Users}
        />

        <MetricCard
          title="Páginas por Sessão"
          value={
            sessionMetrics.avg_page_depth > 0
              ? sessionMetrics.avg_page_depth.toFixed(1)
              : "N/A"
          }
          description="Média de páginas visitadas"
          icon={FileText}
        />

        <MetricCard
          title="Tempo Médio no Site"
          value={
            sessionMetrics.avg_time_on_site > 0
              ? formatTime(sessionMetrics.avg_time_on_site)
              : "N/A"
          }
          description="Duração média da sessão"
          icon={Clock}
        />

        <MetricCard
          title="Taxa de Rejeição"
          value={parseFloat(bounceRate) > 0 ? `${bounceRate}%` : "N/A"}
          description={`${bounceMetrics.bounced_sessions} sessões rejeitadas`}
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
              data={pageDepthDist.map((item: any[]) => ({
                name: item[0],
                value: parseInt(item[1]) || 0,
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
              data={timeDist.map((item: any[]) => ({
                name: item[0],
                value: parseInt(item[1]) || 0,
              }))}
              title="Distribuição de Tempo no Site"
            />
          </CardContent>
        </Card>
      </div>

      {/* Landing pages and referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Landing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {landingPages.length > 0 ? (
              <div className="space-y-2">
                {landingPages.slice(0, 10).map((item: any[], index: number) => {
                  const page = item[0] || "/";
                  const sessions = parseInt(item[1]) || 0;
                  const totalSessions = sessionMetrics.total_sessions || 1;
                  const percentage = ((sessions / totalSessions) * 100).toFixed(
                    1
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border-b last:border-0"
                    >
                      <div className="flex-1 truncate">
                        <p className="text-sm font-mono truncate">{page}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{sessions}</span>
                        <span className="text-xs text-muted-foreground">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Nenhum dado disponível
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fontes de Tráfego</CardTitle>
          </CardHeader>
          <CardContent>
            {referrers.length > 0 ? (
              <div className="space-y-2">
                {referrers.map((item: any[], index: number) => {
                  const source = item[0] || "Desconhecido";
                  const sessions = parseInt(item[1]) || 0;
                  const totalSessions = sessionMetrics.total_sessions || 1;
                  const percentage = ((sessions / totalSessions) * 100).toFixed(
                    1
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: [
                              "hsl(var(--primary))",
                              "hsl(var(--chart-1))",
                              "hsl(var(--chart-2))",
                              "hsl(var(--chart-3))",
                              "hsl(var(--chart-4))",
                            ][index % 5],
                          }}
                        />
                        <span className="text-sm font-medium">{source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{sessions}</span>
                        <span className="text-xs text-muted-foreground">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Nenhum dado disponível
                </p>
              </div>
            )}
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
              {sessionMetrics.returning_visitor_percentage > 0
                ? `${sessionMetrics.returning_visitor_percentage.toFixed(1)}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sessionMetrics.total_sessions > 0
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
            <div className="text-2xl font-bold text-red-600">
              {bounceMetrics.hard_bounces > 0
                ? bounceMetrics.hard_bounces.toLocaleString()
                : "N/A"}
            </div>
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
            <div className="text-2xl font-bold text-orange-600">
              {bounceMetrics.quick_exits > 0
                ? bounceMetrics.quick_exits.toLocaleString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Menos de 30s + scroll baixo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
