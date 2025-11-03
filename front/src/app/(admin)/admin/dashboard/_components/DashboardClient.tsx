'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { RefreshButton } from './RefreshButton'
import { ChartBarDefault } from './ChartBarDefault'
import { useSites, useOverview, type OverviewResponse } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'

export function DashboardClient() {
  const { data: sites } = useSites()
  const firstSite = sites?.[0]
  const { data, isLoading, error } = useOverview(firstSite?.siteKey || '')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Insights</h1>
          <RefreshButton />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Insights</h1>
          <RefreshButton />
        </div>
        <div className="text-sm text-muted-foreground">
          {error?.message || 'Sem dados ainda.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Insights</h1>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartBarDefault />

        <Card>
          <CardHeader>
            <CardTitle>Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.totalEvents.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Eventos registrados no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.totalSessions.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Sessões únicas no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.totalUsers.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Usuários únicos no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo Médio no Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(data.avgTimeOnSite)}s
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Tempo médio de permanência
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>
                <span className="font-medium">Início: </span>
                {new Date(data.period.start).toLocaleDateString('pt-BR')}
              </div>
              <div className="mt-1">
                <span className="font-medium">Fim: </span>
                {new Date(data.period.end).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
