'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import {
  BarChart2,
  Activity,
  MapPin,
  Building2,
  Target,
  CircleDollarSign,
  TrendingUp,
  Users,
  Globe,
  Settings,
  User,
} from "lucide-react";
import { useSites, useOverview, useConversions, useJourneys } from '@/lib/hooks';

export function AdminDashboardClient() {
  const { data: sites } = useSites();
  const firstSite = sites?.[0];

  const { data: overviewData } = useOverview(firstSite?.siteKey || '');
  const { data: conversionsData } = useConversions(firstSite?.siteKey || '');
  const { data: journeysData } = useJourneys(firstSite?.siteKey || '');

  // Calculate metrics from real data
  const totalConversions =
    conversionsData?.conversion_types?.reduce(
      (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
      0
    ) || 0;

  const totalSessions = journeysData?.session_metrics?.total_sessions || 0;

  const conversionRate =
    totalSessions > 0
      ? ((totalConversions / totalSessions) * 100).toFixed(2)
      : "0";

  const bounceRate =
    journeysData?.bounce_metrics?.total_sessions > 0
      ? (
          (journeysData.bounce_metrics.bounced_sessions /
            journeysData.bounce_metrics.total_sessions) *
          100
        ).toFixed(1)
      : "0";

  const metrics = {
    totalVisitors: journeysData?.session_metrics?.total_users || 0,
    totalSites: sites?.length || 0,
    conversionRate: conversionRate,
    bounceRate: bounceRate,
    totalConversions: totalConversions,
    topCity: overviewData?.cidades?.[0]?.[0] || "N/A",
    topPropertyType: overviewData?.tipos?.[0]?.[0] || "N/A",
    topPurpose: overviewData?.finalidade?.[0]?.[0] || "N/A",
    avgPriceRange: overviewData?.preco_venda_ranges?.[0]?.[0] || "N/A",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel de Controle</h1>
        <p className="text-muted-foreground">
          Visão geral das suas métricas e acesso rápido às funcionalidades
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalVisitors > 0
                ? metrics.totalVisitors.toLocaleString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSites > 0
                ? "Últimos 30 dias"
                : "Configure um site primeiro"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Sites Ativos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSites}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSites === 0
                ? "Nenhum site configurado"
                : metrics.totalSites === 1
                ? "Site funcionando"
                : "Sites funcionando"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalConversions > 0
                ? metrics.totalConversions.toLocaleString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {parseFloat(metrics.conversionRate) > 0
                ? `Taxa: ${metrics.conversionRate}%`
                : "Aguardando dados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">
              Taxa de Rejeição
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(metrics.bounceRate) > 0
                ? `${metrics.bounceRate}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {parseFloat(metrics.bounceRate) > 0
                ? parseFloat(metrics.bounceRate) < 25
                  ? "Excelente ✅"
                  : parseFloat(metrics.bounceRate) < 40
                  ? "Normal"
                  : "Precisa melhorar ⚠️"
                : "Aguardando dados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Cidade Líder</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topCity}</div>
            <p className="text-xs text-muted-foreground">
              {overviewData?.cidades?.[0]?.[1]
                ? `${overviewData.cidades[0][1]} pesquisas`
                : "Aguardando dados"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dashboard Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/dashboard">
                <BarChart2 className="h-4 w-4 mr-2" />
                Métricas Principais
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/dashboard/funnel">
                <Activity className="h-4 w-4 mr-2" />
                Funil de Conversão
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/dashboard/cities">
                <MapPin className="h-4 w-4 mr-2" />
                Top Cidades
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/conversions">
                <TrendingUp className="h-4 w-4 mr-2" />
                Todas Conversões
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/journeys">
                <Users className="h-4 w-4 mr-2" />
                Jornadas de Usuários
              </Link>
            </Button>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                {metrics.totalConversions > 0
                  ? `${metrics.totalConversions} conversões`
                  : "Sem dados ainda"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Análise de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/dashboard/types">
                <Building2 className="h-4 w-4 mr-2" />
                Tipos de Imóveis
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/dashboard/purposes">
                <Target className="h-4 w-4 mr-2" />
                Finalidades
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/dashboard/prices">
                <CircleDollarSign className="h-4 w-4 mr-2" />
                Faixas de Preço
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gerenciamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/sites">
                <Globe className="h-4 w-4 mr-2" />
                Gerenciar Sites
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/install">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/account">
                <User className="h-4 w-4 mr-2" />
                Minha Conta
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipo Mais Buscado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {metrics.topPropertyType}
              </span>
              {overviewData?.tipos?.[0]?.[1] && (
                <Badge variant="secondary">
                  {overviewData.tipos[0][1]} pesquisas
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.topPropertyType !== "N/A"
                ? "Tipo mais procurado pelos usuários"
                : "Aguardando dados de pesquisa"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Finalidade Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.topPurpose}</span>
              {overviewData?.finalidade?.[0]?.[1] && (
                <Badge variant="secondary">
                  {overviewData.finalidade[0][1]} pesquisas
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.topPurpose !== "N/A"
                ? "Finalidade mais procurada"
                : "Aguardando dados de pesquisa"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faixa de Preço Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {metrics.avgPriceRange}
              </span>
              {overviewData?.preco_venda_ranges?.[0]?.[1] && (
                <Badge variant="secondary">
                  {overviewData.preco_venda_ranges[0][1]} pesquisas
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.avgPriceRange !== "N/A"
                ? "Faixa mais popular nas pesquisas"
                : "Aguardando dados de pesquisa"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
