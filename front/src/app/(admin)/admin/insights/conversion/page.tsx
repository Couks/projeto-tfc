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
  useFormPerformance,
} from '@/lib/hooks/useInsights'
import { Progress } from '@ui/progress'
import { Alert, AlertDescription } from '@ui/alert'
import { ConversionFunnelChart } from './_components/ConversionFunnelChart'
import { ConversionDistributionChart } from './_components/ConversionDistributionChart'

export default function ConversionAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const {
    data: rateData,
    isLoading: rateLoading,
    error: rateError,
  } = useConversionRate(selectedSiteKey || '')
  const {
    data: funnelData,
    isLoading: funnelLoading,
    error: funnelError,
  } = useConversionFunnel(selectedSiteKey || '')
  const {
    data: sourcesData,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useConversionSources(selectedSiteKey || '')
  const {
    data: formData,
    isLoading: formLoading,
    error: formError,
  } = useFormPerformance(selectedSiteKey || '')

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
  const hasError = rateError || funnelError || sourcesError || formError

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
            {rateLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {rateData?.conversionRate?.toFixed(2) || '0.00'}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rateData?.totalConversions || 0} /{' '}
                  {rateData?.totalSessions || 0} sessões
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
                {(rateData?.totalConversions || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envios</CardTitle>
          </CardHeader>
          <CardContent>
            {formLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {(formData?.totalSubmits || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formData?.completionRate?.toFixed(2) || '0.00'}%
                </div>
                <Progress
                  value={formData?.completionRate || 0}
                  className="mt-2 h-2"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Grid 2 colunas - Funil e Distribuição */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-layer-4">
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
      </div>

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
    </div>
  )
}
