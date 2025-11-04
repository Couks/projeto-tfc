'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
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
} from 'lucide-react'
import { useSites } from '@/lib/hooks'

export function AdminDashboardClient() {
  const { data: sites } = useSites()

  const metrics = {
    totalVisitors: 0,
    totalSessions: 0,
    totalEvents: 0,
    totalSites: sites?.length || 0,
  }

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
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSites > 0
                ? 'Últimos 30 dias'
                : 'Configure um site primeiro'}
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
                ? 'Nenhum site configurado'
                : metrics.totalSites === 1
                  ? 'Site funcionando'
                  : 'Sites funcionando'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalEvents > 0
                ? metrics.totalEvents.toLocaleString()
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalEvents > 0
                ? 'Total de eventos registrados'
                : 'Aguardando dados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Sessões</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalSessions > 0
                ? metrics.totalSessions.toLocaleString()
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSessions > 0
                ? 'Sessões únicas registradas'
                : 'Aguardando dados'}
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
              <Link href="/admin/insights">
                <TrendingUp className="h-4 w-4 mr-2" />
                Insights Dashboard
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/insights/search">
                <Users className="h-4 w-4 mr-2" />
                Search Analytics
              </Link>
            </Button>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                {metrics.totalEvents > 0
                  ? `${metrics.totalEvents} eventos`
                  : 'Sem dados ainda'}
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
    </div>
  )
}
