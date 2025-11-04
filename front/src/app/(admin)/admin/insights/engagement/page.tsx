'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card'
import { Skeleton } from '@/lib/components/ui/skeleton'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useBounceAnalytics, useScrollAnalytics } from '@/lib/hooks/useInsights'
import { Progress } from '@/lib/components/ui/progress'
import { BounceTable } from './_components/BounceTable'
import { EngagedPagesTable } from './_components/EngagedPagesTable'

export default function EngagementAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: bounceData, isLoading: bounceLoading } = useBounceAnalytics(
    selectedSiteKey || ''
  )
  const { data: scrollData, isLoading: scrollLoading } = useScrollAnalytics(
    selectedSiteKey || ''
  )

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Análise de Engajamento
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitore taxas de rejeição, profundidade de scroll e métricas de
          engajamento
        </p>
      </div>

      {/* Engagement Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Rejeição
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bounceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {bounceData?.bounceRate.toFixed(2)}%
                </div>
                <Progress
                  value={bounceData?.bounceRate || 0}
                  className="mt-2 h-2"
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Rejeições
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bounceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {bounceData?.totalBounces.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profundidade Média de Scroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scrollLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {scrollData?.avgScrollDepth.toFixed(0)}%
                </div>
                <Progress
                  value={scrollData?.avgScrollDepth || 0}
                  className="mt-2 h-2"
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipo de Rejeição Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bounceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {bounceData?.bouncesByType[0]?.type || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {bounceData?.bouncesByType[0]?.count || 0} rejeições
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bounce by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Rejeições por Tipo</CardTitle>
          <CardDescription>
            Distribuição dos motivos de rejeição
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bounceLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {bounceData?.bouncesByType.map((item, index) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% de todas as rejeições
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">rejeições</p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              )) || (
                <p className="text-muted-foreground">Sem dados disponíveis</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Bounce Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas com Maior Rejeição</CardTitle>
          <CardDescription>
            Páginas com maiores taxas de rejeição
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bounceLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <BounceTable data={bounceData?.topBouncePages || []} />
          )}
        </CardContent>
      </Card>

      {/* Scroll Depth Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Profundidade de Scroll</CardTitle>
          <CardDescription>
            Quão longe os usuários fazem scroll nas páginas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scrollLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {scrollData?.scrollDistribution.map((item, index) => (
                <div key={item.depth} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {item.depth}%
                      </div>
                      <div>
                        <p className="font-medium">
                          Profundidade de {item.depth}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% de todos os scrolls
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">usuários</p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              )) || (
                <p className="text-muted-foreground">Sem dados disponíveis</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Engaged Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas Mais Engajadas</CardTitle>
          <CardDescription>
            Páginas com maior engajamento de scroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scrollLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <EngagedPagesTable data={scrollData?.topEngagedPages || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
