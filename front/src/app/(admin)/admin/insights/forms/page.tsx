'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card'
import { Skeleton } from '@/lib/components/ui/skeleton'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useFormPerformance, useFormAbandonment } from '@/lib/hooks/useInsights'
import { Progress } from '@/lib/components/ui/progress'
import { FieldAnalyticsTable } from './_components/FieldAnalyticsTable'

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

      {/* Form Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Form Starts</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Abandonment Rate
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Completion Time
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
                  per submission
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Abandonment by Stage */}
      <Card>
        <CardHeader>
          <CardTitle>Abandonment by Stage</CardTitle>
          <CardDescription>Where users leave the form</CardDescription>
        </CardHeader>
        <CardContent>
          {abandonmentLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {abandonmentData?.abandonmentsByStage.map((item, index) => (
                <div key={item.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.stage}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% of all abandonments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        abandonments
                      </p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}

              {abandonmentData && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Abandonments
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {abandonmentData.totalAbandons.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commonly Abandoned Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Commonly Abandoned Fields</CardTitle>
          <CardDescription>
            Fields where users most often drop off
          </CardDescription>
        </CardHeader>
        <CardContent>
          {abandonmentLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {abandonmentData?.commonlyAbandonedFields.map((item, index) => (
                <div
                  key={item.field}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.field}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {item.abandonCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">drop-offs</p>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Field-Level Analytics</CardTitle>
          <CardDescription>
            User interaction with individual form fields
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
