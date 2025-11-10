'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useConversionSummary,
  useConversionSources,
  useLeadProfile,
} from '@/lib/hooks/useInsights'
import { Progress } from '@ui/progress'
import { Alert, AlertDescription } from '@ui/alert'
import { ConversionDistributionChart } from './_components/ConversionDistributionChart'
import { LeadProfileSection } from './_components/LeadProfileSection'
import { Skeleton } from '@/lib/components/ui/skeleton'

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

  return (
    <div className="space-y-6">
      {hasError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar alguns dados. Verifique sua conexão e tente
            novamente.
          </AlertDescription>
        </Alert>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Análise de Conversões
        </h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe taxas de conversão, desempenho do funil e fontes de leads
        </p>
      </div>

      {/* Top Row: 4 métricas em grid 2x2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-layer-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summaryData?.conversionRate?.toFixed(2) || '0.00'}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summaryData?.totalConversions || 0} /{' '}
                  {summaryData?.totalSessions || 0} sessões
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
            {summaryLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <div className="text-2xl font-bold">
                {(summaryData?.totalConversions || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Distribuição de Conversões */}
      <Card className="shadow-layer-4">
        <CardHeader>
          <CardTitle>Conversões por Tipo</CardTitle>
          <CardDescription>
            Distribuição dos eventos de conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConversionDistributionChart
            data={summaryData}
            isLoading={summaryLoading}
          />
        </CardContent>
      </Card>

      {/* Bottom Row: Fontes de Conversão */}
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
              {sourcesData?.sources && sourcesData.sources.length > 0 ? (
                sourcesData.sources.map((item, index) => (
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
                          {(item.conversions || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          conversões
                        </p>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Sem dados disponíveis</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Profile Section */}
      <LeadProfileSection
        data={leadProfileData}
        isLoading={leadProfileLoading}
      />
    </div>
  )
}
