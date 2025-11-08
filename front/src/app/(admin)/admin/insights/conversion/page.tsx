'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useConversionRate,
  useConversionFunnel,
  useConversionSources,
} from '@/lib/hooks/useInsights'
import { Progress } from '@ui/progress'
import { ConversionFunnelChart } from './_components/ConversionFunnelChart'
import { ConversionDistributionChart } from './_components/ConversionDistributionChart'

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

      {/* Top Row: Grid Assimétrico - 2 cards pequenos à esquerda + 1 card grande com gráfico à direita */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Esquerda: 2 cards pequenos empilhados */}
        <div className="space-y-4 md:col-span-1">
          <Card className="shadow-layer-5">
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

          <Card className="shadow-layer-4">
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
        </div>

        {/* Direita: Card grande com gráfico de funil */}
        <Card className="shadow-layer-5 md:col-span-2">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Jornada do usuário desde o primeiro contato até a conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionFunnelChart
              data={funnelData}
              isLoading={funnelLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Card grande com gráfico de distribuição */}
      <Card className="shadow-layer-4">
        <CardHeader>
          <CardTitle>Conversões por Tipo</CardTitle>
          <CardDescription>
            Distribuição dos eventos de conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConversionDistributionChart
            data={rateData}
            isLoading={rateLoading}
          />
        </CardContent>
      </Card>

      {/* Bottom Row: Card full-width com tabela de fontes */}

      {/* Conversion Sources */}
      <Card className="shadow-layer-2">
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
