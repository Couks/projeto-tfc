'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { Spinner } from '@ui/spinner'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  usePopularProperties,
  usePropertyEngagement,
  useCTAPerformance,
} from '@/lib/hooks/useInsights'
import { PopularPropertiesTable } from './_components/PopularPropertiesTable'
import { PopularPropertiesChart } from './_components/PopularPropertiesChart'
import { CTADistributionChart } from './_components/CTADistributionChart'

export default function PropertiesAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: popularData, isLoading: popularLoading } = usePopularProperties(
    selectedSiteKey || ''
  )
  const { data: engagementData, isLoading: engagementLoading } =
    usePropertyEngagement(selectedSiteKey || '')
  const { data: ctaData, isLoading: ctaLoading } = useCTAPerformance(
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
          Análise de Imóveis
        </h1>
        <p className="text-muted-foreground text-lg">
          Descubra quais imóveis geram mais engajamento e oportunidades
        </p>
      </div>

      {/* Top Row: Grid Assimétrico - 2 cards pequenos à esquerda + 1 card grande com gráfico à direita */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Esquerda: 2 cards pequenos empilhados */}
        <div className="grid gap-4 md:grid-rows-2">
          <Card className="shadow-layer-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Visualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {engagementData?.totalViews.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visualizações realizadas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-layer-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {engagementData?.totalFavorites.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Favoritos salvos
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Direita: Card grande com gráfico de imóveis populares */}
        <Card className="shadow-layer-5 md:col-span-3">
          <CardHeader>
            <CardTitle>Top 5 Imóveis Mais Populares</CardTitle>
            <CardDescription>
              Imóveis com maior pontuação de engajamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PopularPropertiesChart
              data={popularData}
              isLoading={popularLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Grid 2 colunas - Gráfico de CTAs + Lista de desempenho */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição de CTAs - Gráfico */}
        <Card className="shadow-layer-4">
          <CardHeader>
            <CardTitle>Distribuição de Chamadas para Ação</CardTitle>
            <CardDescription>
              Como os usuários interagem com CTAs de imóveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CTADistributionChart
              data={engagementData}
              isLoading={engagementLoading}
            />
          </CardContent>
        </Card>

        {/* Taxa de Conversão de CTAs - Lista */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Taxa de Cliques e Conversão de CTAs</CardTitle>
            <CardDescription>
              Métricas de desempenho para cada tipo de CTA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ctaLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {ctaData?.ctas.map((item, index) => (
                  <div
                    key={item.ctaType}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.ctaType}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.conversionRate.toFixed(2)}% taxa de conversão
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {item.clicks.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">cliques</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Card full-width com tabela de imóveis populares */}
      <Card className="shadow-inner-5">
        <CardHeader>
          <CardTitle>Imóveis Mais Populares</CardTitle>
          <CardDescription>
            Imóveis com maior pontuação de engajamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {popularLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <PopularPropertiesTable data={popularData?.properties || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
