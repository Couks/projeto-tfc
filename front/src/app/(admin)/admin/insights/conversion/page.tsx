'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Spinner } from '@ui/spinner'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useConversionSummary,
  useConversionSources,
  useLeadProfile,
} from '@/lib/hooks/useInsights'
import { Alert, AlertDescription } from '@ui/alert'
import { ConversionDistributionChart } from './_components/ConversionDistributionChart'
import { LeadProfileSection } from './_components/LeadProfileSection'
import { Skeleton } from '@/lib/components/ui/skeleton'
import {
  DetailsModal,
  type DetailsDataItem,
} from '@/lib/components/insights/DetailsModal'
import {
  TrendingUp,
  Target,
  Users,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'

export default function ConversionAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useConversionSummary(selectedSiteKey || '')
  const {
    data: sourcesData,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useConversionSources(selectedSiteKey || '')
  const {
    data: leadProfileData,
    isLoading: leadProfileLoading,
    error: leadProfileError,
  } = useLeadProfile(selectedSiteKey || '')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<{
    title: string
    description?: string
    data: DetailsDataItem[]
    visualization?: 'table' | 'list' | 'chart-bars'
    recommendations?: string[]
  }>({
    title: '',
    data: [],
  })

  const openDetailsModal = (
    title: string,
    data: DetailsDataItem[],
    description?: string,
    recommendations?: string[],
    visualization: 'table' | 'list' | 'chart-bars' = 'chart-bars'
  ) => {
    setModalData({ title, description, data, visualization, recommendations })
    setModalOpen(true)
  }

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  // Check for errors
  const hasError = summaryError || sourcesError || leadProfileError

  // Calculate metrics
  const conversionRate = summaryData?.conversionRate || 0
  const totalConversions = summaryData?.totalConversions || 0
  const totalSessions = summaryData?.totalSessions || 0

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/admin/insights">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Visão Geral
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise de Conversões
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe taxas de conversão, desempenho do funil e fontes de leads
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar alguns dados. Verifique sua conexão e tente
            novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-layer-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {conversionRate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalConversions} / {totalSessions} sessões
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
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {totalConversions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Conversões registradas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Sessões
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {totalSessions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sessões rastreadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipos de Conversão
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summaryData?.conversionsByType?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tipos identificados
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Distribution */}
      <Card className="shadow-inner-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Conversões por Tipo</CardTitle>
            <CardDescription>
              Distribuição dos eventos de conversão
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const types = summaryData?.conversionsByType || []
              openDetailsModal(
                'Conversões Detalhadas por Tipo',
                types.map((t) => ({
                  label: t.type,
                  value: t.count,
                  percentage:
                    (t.count / (summaryData?.totalConversions || 1)) * 100,
                })),
                'Análise completa de todos os tipos de conversão',
                [
                  `O tipo mais comum é ${types[0]?.type || 'N/A'}`,
                  'Otimize os CTAs dos tipos com menor volume',
                  'Considere A/B tests para melhorar conversões',
                ]
              )
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ConversionDistributionChart
            data={summaryData}
            isLoading={summaryLoading}
          />
        </CardContent>
      </Card>

      {/* Conversion Sources */}
      <Card className="shadow-inner-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fontes de Conversão</CardTitle>
            <CardDescription>De onde vêm as suas conversões</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const sources = sourcesData?.sources || []
              openDetailsModal(
                'Fontes de Conversão Detalhadas',
                sources.map((s) => ({
                  label: s.source,
                  value: s.conversions,
                  subValue: `Percentual: ${s.percentage.toFixed(2)}%`,
                  percentage: s.percentage,
                })),
                'Análise completa de todas as fontes de tráfego',
                [
                  'Invista mais nas fontes com maior taxa de conversão',
                  'Analise fontes com alto tráfego mas baixa conversão',
                  'Crie campanhas específicas para cada fonte',
                ],
                'list'
              )
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sourcesData?.sources && sourcesData.sources.length > 0 ? (
            <div className="space-y-4">
              {sourcesData.sources.map((source, index) => {
                const maxConversions = sourcesData.sources[0]?.conversions || 1
                const widthPercent = (source.conversions / maxConversions) * 100

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{source.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {source.conversions.toLocaleString()} conversões •
                          {source.percentage.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {source.conversions.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lead Profile Section */}
      <Card className="shadow-inner-3">
        <CardHeader>
          <CardTitle>Perfil dos Leads</CardTitle>
          <CardDescription>
            Características demográficas e comportamentais dos leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadProfileSection
            data={leadProfileData}
            isLoading={leadProfileLoading}
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      <DetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalData.title}
        description={modalData.description}
        data={modalData.data}
        visualization={modalData.visualization}
        recommendations={modalData.recommendations}
      />
    </div>
  )
}
