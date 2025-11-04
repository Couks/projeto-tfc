'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Skeleton } from '@/lib/components/ui/skeleton'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useBounceAnalytics, useScrollAnalytics } from '@/lib/hooks/useInsights'
import { Progress } from '@/lib/components/ui/progress'

export default function EngagementAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: bounceData, isLoading: bounceLoading } = useBounceAnalytics(selectedSiteKey || '')
  const { data: scrollData, isLoading: scrollLoading } = useScrollAnalytics(selectedSiteKey || '')

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
        <h1 className="text-3xl font-bold">Engagement Analytics</h1>
        <p className="text-muted-foreground">
          Monitor bounce rates, scroll depth, and user engagement metrics
        </p>
      </div>

      {/* Engagement Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {bounceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">{bounceData?.bounceRate.toFixed(2)}%</div>
                <Progress value={bounceData?.bounceRate || 0} className="mt-2 h-2" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bounces</CardTitle>
          </CardHeader>
          <CardContent>
            {bounceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{bounceData?.totalBounces.toLocaleString() || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scroll Depth</CardTitle>
          </CardHeader>
          <CardContent>
            {scrollLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{scrollData?.avgScrollDepth.toFixed(0)}%</div>
                <Progress value={scrollData?.avgScrollDepth || 0} className="mt-2 h-2" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Bounce Type</CardTitle>
          </CardHeader>
          <CardContent>
            {bounceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{bounceData?.bouncesByType[0]?.type || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {bounceData?.bouncesByType[0]?.count || 0} bounces
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bounce by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Bounces by Type</CardTitle>
          <CardDescription>Breakdown of bounce reasons</CardDescription>
        </CardHeader>
        <CardContent>
          {bounceLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {bounceData?.bouncesByType.map((item, index) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% of all bounces
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">bounces</p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Bounce Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Bounce Pages</CardTitle>
          <CardDescription>Pages with highest bounce rates</CardDescription>
        </CardHeader>
        <CardContent>
          {bounceLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Page URL
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Bounces
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Bounce Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bounceData?.topBouncePages.map((page, index) => (
                      <tr key={page.url} className="border-b">
                        <td className="p-4 align-middle">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-medium">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-4 align-middle font-medium max-w-md truncate" title={page.url}>
                          {page.url}
                        </td>
                        <td className="p-4 align-middle text-right">{page.bounces.toLocaleString()}</td>
                        <td className="p-4 align-middle text-right">
                          <span className="font-semibold">{page.bounceRate.toFixed(1)}%</span>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scroll Depth Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Scroll Depth Distribution</CardTitle>
          <CardDescription>How far users scroll on pages</CardDescription>
        </CardHeader>
        <CardContent>
          {scrollLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {scrollData?.scrollDistribution.map((item, index) => (
                <div key={item.depth} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {item.depth}%
                      </div>
                      <div>
                        <p className="font-medium">{item.depth}% Scroll Depth</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% of all scrolls
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">users</p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Engaged Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Most Engaged Pages</CardTitle>
          <CardDescription>Pages with highest scroll engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {scrollLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Page URL
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Avg Scroll Depth
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Deep Scrolls (75%+)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrollData?.topEngagedPages.map((page, index) => (
                      <tr key={page.url} className="border-b">
                        <td className="p-4 align-middle">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-4 align-middle font-medium max-w-md truncate" title={page.url}>
                          {page.url}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <span className="font-semibold">{page.avgScrollDepth.toFixed(0)}%</span>
                        </td>
                        <td className="p-4 align-middle text-right">{page.deepScrolls.toLocaleString()}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

