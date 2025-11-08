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
import { useFormPerformance, useFormAbandonment } from '@/lib/hooks/useInsights'
import { Progress } from '@ui/progress'
import { FieldAnalyticsTable } from './_components/FieldAnalyticsTable'
import { AbandonmentChart } from './_components/AbandonmentChart'

export default function FormsAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: performanceData, isLoading: performanceLoading } =
    useFormPerformance(selectedSiteKey || '')
  const { data: abandonmentData, isLoading: abandonmentLoading } =
    useFormAbandonment(selectedSiteKey || '')

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
          Análise de Formulários
        </h1>
        <p className="text-muted-foreground text-lg">
          Otimize formulários e aumente suas taxas de captura de leads
        </p>
      </div>

      {/* Top Row: Grid 3 colunas - 2 cards pequenos + 1 card médio span 2 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-layer-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inícios de Formulário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {performanceData?.totalStarts.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envios</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {performanceData?.totalSubmits.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-3 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {performanceData?.completionRate.toFixed(2)}%
                </div>
                <Progress
                  value={performanceData?.completionRate || 0}
                  className="mt-2 h-2"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Grid 2 colunas - Gráfico de abandono + Métricas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Abandono por Estágio - Gráfico */}
        <Card className="shadow-layer-4">
          <CardHeader>
            <CardTitle>Abandono por Estágio</CardTitle>
            <CardDescription>
              Onde os usuários abandonam o formulário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AbandonmentChart
              data={abandonmentData}
              isLoading={abandonmentLoading}
            />
          </CardContent>
        </Card>

        {/* Métricas Adicionais */}
        <div className="space-y-4">
          <Card className="shadow-layer-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Abandono
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-destructive">
                    {performanceData?.abandonmentRate.toFixed(2)}%
                  </div>
                  <Progress
                    value={performanceData?.abandonmentRate || 0}
                    className="mt-2 h-2"
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-layer-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Médio de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {performanceData?.avgCompletionTime.toFixed(0)}s
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    por envio
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Card full-width com tabela de campos abandonados e análise */}
      <Card className="shadow-inner-5">
        <CardHeader>
          <CardTitle>Análise por Campo</CardTitle>
          <CardDescription>
            Interação do usuário com campos individuais do formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {performanceLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <FieldAnalyticsTable data={performanceData?.fieldAnalytics || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
