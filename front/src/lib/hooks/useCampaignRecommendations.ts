import { useMemo } from 'react'
import type {
  SearchAnalyticsResponse,
  ConversionRateResponse,
  PopularPropertiesResponse,
  DevicesResponse,
  TopConvertingFiltersResponse,
} from '../types/insights'

export interface CampaignRecommendation {
  id: string
  type: 'search' | 'conversion' | 'property' | 'device'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: string
  data?: Record<string, any>
}

interface RecommendationsInput {
  searchData?: SearchAnalyticsResponse
  conversionData?: ConversionRateResponse
  propertiesData?: PopularPropertiesResponse
  devicesData?: DevicesResponse
  topFiltersData?: TopConvertingFiltersResponse
}

export function useCampaignRecommendations(input: RecommendationsInput) {
  const recommendations = useMemo(() => {
    const recs: CampaignRecommendation[] = []

    // Search-based recommendations
    if (input.searchData) {
      // Top city recommendation
      if (input.searchData.topCidades && input.searchData.topCidades.length > 0) {
        const topCity = input.searchData.topCidades[0]
        recs.push({
          id: 'top-city',
          type: 'search',
          priority: 'high',
          title: `Priorize imóveis em ${topCity.cidade}`,
          description: `${topCity.cidade} representa ${((topCity.count / input.searchData.totalSearches) * 100).toFixed(1)}% das buscas. Destaque imóveis desta região em suas campanhas.`,
          action: 'Ver análise de buscas',
          data: { city: topCity.cidade, count: topCity.count },
        })
      }

      // Top purpose recommendation
      if (input.searchData.topFinalidades && input.searchData.topFinalidades.length > 0) {
        const topPurpose = input.searchData.topFinalidades[0]
        recs.push({
          id: 'top-purpose',
          type: 'search',
          priority: 'medium',
          title: `Foco em imóveis para ${topPurpose.finalidade}`,
          description: `${((topPurpose.count / input.searchData.totalSearches) * 100).toFixed(1)}% das buscas são para ${topPurpose.finalidade}. Otimize seu inventário para esta finalidade.`,
          action: 'Ver análise de buscas',
          data: { purpose: topPurpose.finalidade, count: topPurpose.count },
        })
      }
    }

    // Conversion-based recommendations
    if (input.conversionData) {
      const conversionRate = input.conversionData.conversionRate || 0

      if (conversionRate < 1) {
        recs.push({
          id: 'low-conversion',
          type: 'conversion',
          priority: 'high',
          title: 'Taxa de conversão abaixo do ideal',
          description: `Sua taxa atual é ${conversionRate.toFixed(2)}%. Otimize CTAs e formulários para melhorar este indicador.`,
          action: 'Ver análise de conversões',
          data: { rate: conversionRate },
        })
      } else if (conversionRate > 3) {
        recs.push({
          id: 'high-conversion',
          type: 'conversion',
          priority: 'low',
          title: 'Excelente taxa de conversão!',
          description: `Sua taxa de ${conversionRate.toFixed(2)}% está acima da média. Continue investindo nas estratégias atuais.`,
          action: 'Ver análise de conversões',
          data: { rate: conversionRate },
        })
      }

      // Top conversion type
      if (input.conversionData.conversionsByType && input.conversionData.conversionsByType.length > 0) {
        const topType = input.conversionData.conversionsByType[0]
        recs.push({
          id: 'top-conversion-type',
          type: 'conversion',
          priority: 'medium',
          title: `${topType.type} é sua principal fonte de conversão`,
          description: `Represente ${((topType.count / input.conversionData.totalConversions) * 100).toFixed(1)}% das conversões. Otimize este canal.`,
          action: 'Ver análise de conversões',
          data: { type: topType.type, count: topType.count },
        })
      }
    }

    // Property-based recommendations
    if (input.propertiesData) {
      if (input.propertiesData.properties && input.propertiesData.properties.length > 0) {
        const topProperty = input.propertiesData.properties[0]
        const viewToFavoriteRatio = topProperty.favorites > 0
          ? topProperty.views / topProperty.favorites
          : 0

        if (viewToFavoriteRatio > 20) {
          recs.push({
            id: 'property-low-favorites',
            type: 'property',
            priority: 'medium',
            title: `Imóvel ${topProperty.codigo} tem baixo engajamento`,
            description: `Apesar de ${topProperty.views} visualizações, tem apenas ${topProperty.favorites} favoritos. Melhore fotos e descrição.`,
            action: 'Ver análise de imóveis',
            data: { code: topProperty.codigo, views: topProperty.views, favorites: topProperty.favorites },
          })
        }
      }
    }

    // Device-based recommendations
    if (input.devicesData) {
      const mobileDevices = input.devicesData.devices?.filter(d =>
        d.deviceType.toLowerCase() === 'mobile'
      ) || []

      const totalDevices = input.devicesData.devices?.reduce((sum, d) => sum + (d.count || 0), 0) || 0
      const mobileCount = mobileDevices.reduce((sum, d) => sum + (d.count || 0), 0)
      const mobilePercent = totalDevices > 0 ? (mobileCount / totalDevices) * 100 : 0

      if (mobilePercent > 60) {
        recs.push({
          id: 'mobile-optimization',
          type: 'device',
          priority: 'high',
          title: 'Otimize para dispositivos móveis',
          description: `${mobilePercent.toFixed(1)}% dos acessos são via mobile. Garanta que seu site esteja otimizado para estes dispositivos.`,
          action: 'Ver análise de dispositivos',
          data: { mobilePercent, mobileCount },
        })
      }
    }

    // Top converting filters recommendation
    if (input.topFiltersData) {
      if (input.topFiltersData.filters && input.topFiltersData.filters.length > 0) {
        const topFilter = input.topFiltersData.filters[0]
        recs.push({
          id: 'top-converting-filter',
          type: 'search',
          priority: 'high',
          title: `Combinação de filtros com alta conversão`,
          description: `Esta combinação gerou ${topFilter.conversions} conversões. Destaque imóveis que atendem estes critérios.`,
          action: 'Ver filtros que convertem',
          data: { filters: topFilter.combination, conversions: topFilter.conversions },
        })
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }, [input])

  return recommendations
}

