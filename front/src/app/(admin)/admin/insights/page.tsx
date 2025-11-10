'use client'

import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useSearchSummary,
  useConversionSummary,
  usePopularProperties,
  useDevices,
  useTopConvertingFilters,
} from '@/lib/hooks/useInsights'
import { useCampaignRecommendations } from '@/lib/hooks/useCampaignRecommendations'
import { QuickMetricsGrid } from './_components/QuickMetricsGrid'
import { InsightsSummaryCharts } from './_components/InsightsSummaryCharts'
import { QuickActionsSection } from './_components/QuickActionsSection'
import { RecommendationCard } from '@/lib/components/insights/RecommendationCard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Lightbulb } from 'lucide-react'

export default function InsightsOverviewPage() {
  const { selectedSiteKey } = useSiteContext()

  // Fetch data from all categories
  const { data: searchData, isLoading: isLoadingSearch } = useSearchSummary(
    selectedSiteKey || '',
    { limit: 10 }
  )

  const { data: conversionData, isLoading: isLoadingConversion } =
    useConversionSummary(selectedSiteKey || '')

  const { data: propertiesData, isLoading: isLoadingProperty } =
    usePopularProperties(selectedSiteKey || '', { limit: 10 })

  const { data: devicesData, isLoading: isLoadingDevices } = useDevices(
    selectedSiteKey || '',
    { limit: 10 }
  )

  const { data: topFiltersData } = useTopConvertingFilters(
    selectedSiteKey || '',
    { limit: 10 }
  )

  // Generate campaign recommendations
  const recommendations = useCampaignRecommendations({
    searchData,
    conversionData,
    propertiesData,
    devicesData,
    topFiltersData,
  })

  // Calculate metrics for QuickMetricsGrid
  const totalSearches = searchData?.totalSearches || 0
  const conversionRate = conversionData?.conversionRate || 0
  const topPropertyViews = propertiesData?.properties?.[0]?.views || 0

  // Transform properties data to match expected format
  const transformedProperties = propertiesData?.properties?.map((prop) => ({
    propertyCode: prop.codigo,
    views: prop.views,
    favorites: prop.favorites,
  }))

  const totalDevices =
    devicesData?.devices?.reduce((sum, d) => sum + (d.count || 0), 0) || 0
  const mobileCount =
    devicesData?.devices
      ?.filter((d) => d.deviceType.toLowerCase() === 'mobile')
      ?.reduce((sum, d) => sum + (d.count || 0), 0) || 0
  const mobilePercent =
    totalDevices > 0 ? (mobileCount / totalDevices) * 100 : 0

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Visão Geral - Insights
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Dashboard consolidado com métricas principais e recomendações de
          campanhas
        </p>
      </div>

      {/* Quick Metrics Grid */}
      <QuickMetricsGrid
        totalSearches={totalSearches}
        conversionRate={conversionRate}
        topPropertyViews={topPropertyViews}
        mobilePercent={mobilePercent}
        isLoadingSearch={isLoadingSearch}
        isLoadingConversion={isLoadingConversion}
        isLoadingProperty={isLoadingProperty}
        isLoadingDevices={isLoadingDevices}
      />

      {/* Campaign Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">
              Recomendações de Campanhas
            </h2>
          </div>
          <p className="text-muted-foreground">
            Insights acionáveis baseados no comportamento dos visitantes do seu
            site
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary Charts */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Resumo das Análises</h2>
          <p className="text-muted-foreground mt-1">
            Visualização rápida dos dados principais de cada categoria
          </p>
        </div>
        <InsightsSummaryCharts
          topCities={searchData?.topCidades}
          conversionsByType={conversionData?.conversionsByType}
          topProperties={transformedProperties}
          topDevices={devicesData?.devices}
          isLoadingSearch={isLoadingSearch}
          isLoadingConversion={isLoadingConversion}
          isLoadingProperty={isLoadingProperty}
          isLoadingDevices={isLoadingDevices}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsSection />

      {/* Guide */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Como Usar Esta Plataforma</CardTitle>
          <CardDescription>
            Guia prático para transformar dados em campanhas efetivas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              1. Analise as Métricas Principais
            </h3>
            <p className="text-sm text-muted-foreground">
              Comece observando os cards de métricas no topo. Eles mostram um
              panorama geral do comportamento dos visitantes: volume de buscas,
              taxa de conversão, imóveis mais populares e dispositivos
              utilizados.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Priorize as Recomendações</h3>
            <p className="text-sm text-muted-foreground">
              Nossa IA analisa seus dados e sugere ações práticas. Recomendações
              de alta prioridade (em vermelho) indicam oportunidades imediatas
              de melhoria ou riscos que precisam de atenção.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Explore Análises Detalhadas
            </h3>
            <p className="text-sm text-muted-foreground">
              Use os botões de &quot;Análises Avançadas&quot; para aprofundar em
              cada categoria: Buscas, Imóveis ou Conversões. Lá você encontrará
              dados granulares e modais com detalhamentos específicos.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">4. Aplique os Insights</h3>
            <p className="text-sm text-muted-foreground">
              Use os dados para criar campanhas segmentadas, otimizar landing
              pages, destacar imóveis estratégicos e melhorar a experiência do
              usuário. Acompanhe as mudanças nas métricas ao longo do tempo para
              validar suas ações.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
