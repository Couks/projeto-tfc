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
import {
  useConversionRate,
  useConversionFunnel,
  useConversionSources,
} from '@/lib/hooks/useInsights'
import { Progress } from '@/lib/components/ui/progress'

export default function ConversionAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: rateData, isLoading: rateLoading } = useConversionRate(
    selectedSiteKey || ''
  )
  const { data: funnelData, isLoading: funnelLoading } = useConversionFunnel(
    selectedSiteKey || ''
  )
  const { data: sourcesData, isLoading: sourcesLoading } = useConversionSources(
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
          Análise de Conversões
        </h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe taxas de conversão, desempenho do funil e fontes de leads
        </p>
      </div>

      {/* Conversion Rate Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rateLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {rateData?.conversionRate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rateData?.totalConversions} / {rateData?.totalSessions}{' '}
                  sessões
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rateLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {rateData?.totalConversions.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa do Funil Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {funnelData?.overallConversionRate.toFixed(2)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fonte Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {sourcesData?.sources[0]?.source || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {sourcesData?.sources[0]?.conversions || 0} conversões
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversions by Type */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Conversões por Tipo</CardTitle>
          <CardDescription>
            Distribuição dos eventos de conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rateLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {rateData?.conversionsByType.map((item, index) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{item.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% de todas as conversões
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        conversões
                      </p>
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

      {/* Conversion Funnel */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>
            Jornada do usuário desde o primeiro contato até a conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {funnelLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {funnelData?.stages.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stage.stage}</p>
                      <p className="text-xs text-muted-foreground">
                        {stage.percentage.toFixed(1)}% do total
                        {index > 0 &&
                          ` · ${stage.dropoffRate.toFixed(1)}% de desistência da etapa anterior`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {stage.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">usuários</p>
                    </div>
                  </div>
                  <Progress value={stage.percentage} className="h-3" />
                </div>
              )) || (
                <p className="text-muted-foreground">Sem dados disponíveis</p>
              )}

              {funnelData && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Desempenho Geral do Funil
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {funnelData.overallConversionRate.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Completados / Iniciados
                      </p>
                      <p className="text-lg font-semibold mt-1">
                        {funnelData.totalCompleted.toLocaleString()} /{' '}
                        {funnelData.totalStarted.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Conversão</CardTitle>
          <CardDescription>De onde vêm as suas conversões</CardDescription>
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sourcesData?.sources.map((item, index) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% das conversões
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {item.conversions.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        conversões
                      </p>
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
    </div>
  )
}
