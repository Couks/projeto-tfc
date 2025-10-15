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
  Eye,
  MousePointer,
  Globe,
  Settings,
  User,
} from "lucide-react";

export default function AdminHome() {
  // Mock data - in real app, fetch from API
  const metrics = {
    totalVisitors: 12456,
    totalSites: 3,
    conversionRate: 3.2,
    topCity: "São Paulo",
    topPropertyType: "Apartamentos",
    topPurpose: "Venda",
    avgPriceRange: "R$ 200k - R$ 500k",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.3% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Ativos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSites}</div>
            <p className="text-xs text-muted-foreground">
              Todos funcionando normalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cidade Líder</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topCity}</div>
            <p className="text-xs text-muted-foreground">
              1,234 pesquisas (14.6%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Badge variant="secondary">45.2%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Apartamentos lideram as pesquisas
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
              <Badge variant="secondary">68.5%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Venda é a finalidade mais procurada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faixa de Preço Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {metrics.avgPriceRange}
              </span>
              <Badge variant="secondary">35.2%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Faixa mais popular nas pesquisas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


