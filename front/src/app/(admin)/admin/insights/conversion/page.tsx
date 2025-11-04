'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Skeleton } from '@/lib/components/ui/skeleton'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useConversionRate, useConversionFunnel, useConversionSources } from '@/lib/hooks/useInsights'
import { Progress } from '@/lib/components/ui/progress'

export default function ConversionAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: rateData, isLoading: rateLoading } = useConversionRate(selectedSiteKey || '')
  const { data: funnelData, isLoading: funnelLoading } = useConversionFunnel(selectedSiteKey || '')
  const { data: sourcesData, isLoading: sourcesLoading } = useConversionSources(selectedSiteKey || '')

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please select a site to view insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conversion Analytics</h1>
        <p className="text-muted-foreground">
          Track conversion rates, funnel performance, and conversion sources
        </p>
      </div>

      {/* Conversion Rate Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {rateLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{rateData?.conversionRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rateData?.totalConversions} / {rateData?.totalSessions} sessions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            {rateLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{rateData?.totalConversions.toLocaleString() || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Funnel Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{funnelData?.overallConversionRate.toFixed(2)}%</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{sourcesData?.sources[0]?.source || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {sourcesData?.sources[0]?.conversions || 0} conversions
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversions by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Conversions by Type</CardTitle>
          <CardDescription>Breakdown of conversion events</CardDescription>
        </CardHeader>
        <CardContent>
          {rateLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {rateData?.conversionsByType.map((item, index) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}% of all conversions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">conversions</p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from awareness to conversion</CardDescription>
        </CardHeader>
        <CardContent>
          {funnelLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {funnelData?.stages.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stage.stage}</p>
                      <p className="text-xs text-muted-foreground">
                        {stage.percentage.toFixed(1)}% of total
                        {index > 0 && ` · ${stage.dropoffRate.toFixed(1)}% drop-off from previous`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{stage.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">users</p>
                    </div>
                  </div>
                  <Progress value={stage.percentage} className="h-3" />
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}

              {funnelData && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Funnel Performance</p>
                      <p className="text-2xl font-bold mt-1">{funnelData.overallConversionRate.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Completed / Started</p>
                      <p className="text-lg font-semibold mt-1">
                        {funnelData.totalCompleted.toLocaleString()} / {funnelData.totalStarted.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Sources</CardTitle>
          <CardDescription>Where conversions are coming from</CardDescription>
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
              {sourcesData?.sources.map((item, index) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.source}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}% of conversions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.conversions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">conversions</p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

