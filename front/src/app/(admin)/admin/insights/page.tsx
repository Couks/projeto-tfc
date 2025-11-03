'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { MetricCard } from '@/lib/components/MetricCard'
import { SiteSelector } from '@/lib/components/SiteSelector'
import { DateFilter } from '@/lib/types/insights'
import { DateFilter as DateFilterPicker } from '@/lib/components/DateFilter'
import { useState } from 'react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useOverview,
  useTopEvents,
  useTopCities,
  useDevices,
} from '@/lib/hooks/useInsights'

export default function InsightsOverviewPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('MONTH')
  const {
    selectedSiteKey,
    setSelectedSiteKey,
    isLoading: sitesLoading,
  } = useSiteContext()

  const commonQuery = { dateFilter } as const
  const { data: overview, isLoading: overviewLoading } = useOverview(
    selectedSiteKey || '',
    commonQuery
  )
  const { data: topEvents, isLoading: eventsLoading } = useTopEvents(
    selectedSiteKey || '',
    { ...commonQuery, limit: 5 }
  )
  const { data: topCities, isLoading: citiesLoading } = useTopCities(
    selectedSiteKey || '',
    { ...commonQuery, limit: 5 }
  )
  const { data: devices, isLoading: devicesLoading } = useDevices(
    selectedSiteKey || '',
    commonQuery
  )

  const isLoading = sitesLoading || overviewLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Insights</h1>
          <p className="text-muted-foreground">
            Overview, Top events, Cities e Devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilterPicker value={dateFilter} onChange={setDateFilter} />
          <div className="w-64">
            <SiteSelector
              value={selectedSiteKey}
              onValueChange={(v) => setSelectedSiteKey(v)}
              placeholder="Selecione um site"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Events"
            value={overview?.eventsCount?.toLocaleString() ?? '0'}
            description="Últimos 30 dias"
          />
          <MetricCard
            title="Sessions"
            value={overview?.sessionsCount?.toLocaleString() ?? '0'}
            description="Últimos 30 dias"
          />
          <MetricCard
            title="Users"
            value={overview?.usersCount?.toLocaleString() ?? '0'}
            description="Últimos 30 dias"
          />
          <MetricCard
            title="Avg Time (s)"
            value={(overview?.avgTimeOnSite ?? 0).toFixed(0)}
            description="Tempo médio no site"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="text-sm">
                {topEvents?.topEvents?.length ? (
                  <ul className="space-y-2">
                    {topEvents.topEvents.map((e) => (
                      <li
                        key={e.name}
                        className="flex justify-between border-b py-1"
                      >
                        <span>{e.name}</span>
                        <span className="font-medium">
                          {e.count.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">No data available</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            {citiesLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="text-sm">
                {topCities?.topCities?.length ? (
                  <ul className="space-y-2">
                    {topCities.topCities.map((c) => (
                      <li
                        key={c.city}
                        className="flex justify-between border-b py-1"
                      >
                        <span>{c.city}</span>
                        <span className="font-medium">
                          {c.count.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">No data available</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {devicesLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="text-sm">
              {devices?.deviceDistribution?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {devices.deviceDistribution.map((d, idx) => (
                    <div
                      key={`${d.deviceType}-${d.os}-${d.browser}-${idx}`}
                      className="flex justify-between border-b py-1"
                    >
                      <span>
                        {d.deviceType} • {d.os} • {d.browser}
                      </span>
                      <span className="font-medium">
                        {d.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
