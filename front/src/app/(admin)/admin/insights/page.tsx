'use client'

import { useState } from 'react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useSearchSummary,
  useConversionSummary,
  usePopularProperties,
  useTopConvertingFilters,
  useDevicesTimeSeries,
} from '@/lib/hooks/useInsights'
import { useCampaignRecommendations } from '@/lib/hooks/useCampaignRecommendations'
import { QuickMetricsGrid } from './_components/QuickMetricsGrid'
import { QuickActionsSection } from './_components/QuickActionsSection'
import { RecommendationCard } from '@/lib/components/insights/RecommendationCard'
import { PeriodSelector } from '@/lib/components/insights/PeriodSelector'

import { Lightbulb } from 'lucide-react'
import type { InsightsQuery } from '@/lib/types/insights'
import { DevicesChart } from './search/_components/DevicesChart'

export default function InsightsOverviewPage() {
  const { selectedSiteKey } = useSiteContext()
  const [dateQuery, setDateQuery] = useState<InsightsQuery>({})

  const handlePeriodChange = (start: Date, end: Date) => {
    setDateQuery({
      dateFilter: 'CUSTOM',
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    })
  }

  // Fetch data from all categories with date filter
  const { data: searchData, isLoading: isLoadingSearch } = useSearchSummary(
    selectedSiteKey || '',
    { limit: 10, ...dateQuery }
  )

  const { data: conversionData, isLoading: isLoadingConversion } =
    useConversionSummary(selectedSiteKey || '', dateQuery)

  const { data: propertiesData, isLoading: isLoadingProperty } =
    usePopularProperties(selectedSiteKey || '', { limit: 10, ...dateQuery })

  const { data: topFiltersData } = useTopConvertingFilters(
    selectedSiteKey || '',
    { limit: 10, ...dateQuery }
  )

  const { data: devicesData, isLoading: isLoadingDevices } =
    useDevicesTimeSeries(selectedSiteKey || '', dateQuery)

  // Generate campaign recommendations
  const recommendations = useCampaignRecommendations({
    searchData,
    conversionData,
    propertiesData,
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

  // Calculate mobile percentage from devices time series data
  const totalDevices =
    devicesData?.data?.reduce(
      (sum, item) => sum + (item.mobile || 0) + (item.desktop || 0),
      0
    ) || 0
  const mobileCount =
    devicesData?.data?.reduce((sum, item) => sum + (item.mobile || 0), 0) || 0
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visão Geral - Insights
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Dashboard consolidado com métricas principais e recomendações de
            campanhas
          </p>
        </div>
        <PeriodSelector onPeriodChange={handlePeriodChange} />
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

      {/* Devices Chart */}
      <DevicesChart data={devicesData} isLoading={isLoadingDevices} />

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

      {/* Quick Actions */}
      <QuickActionsSection />
    </div>
  )
}
