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
  usePopularProperties,
  usePropertyEngagement,
  useCTAPerformance,
} from '@/lib/hooks/useInsights'
import { PopularPropertiesTable } from './_components/PopularPropertiesTable'

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

      {/* Engagement Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagementLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {engagementData?.totalViews.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagementLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {engagementData?.totalFavorites.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Compartilhamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagementLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {engagementData?.totalShares.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio no Imóvel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagementLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {engagementData?.avgTimeOnProperty.toFixed(0)}s
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  por visualização
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho de Chamadas para Ação</CardTitle>
          <CardDescription>
            Como os usuários interagem com CTAs de imóveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {engagementLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Fazer Proposta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {engagementData?.ctaPerformance.fazerProposta.toLocaleString() ||
                        0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      cliques
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Alugar Imóvel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {engagementData?.ctaPerformance.alugarImovel.toLocaleString() ||
                        0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      cliques
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Mais Informações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {engagementData?.ctaPerformance.maisInformacoes.toLocaleString() ||
                        0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      cliques
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CTA Conversion Rates */}
      <Card>
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
                    <p className="font-bold">{item.clicks.toLocaleString()}</p>
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

      {/* Popular Properties Table */}
      <Card>
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
