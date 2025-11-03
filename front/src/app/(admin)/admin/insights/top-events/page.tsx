'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { SiteSelector } from '@/lib/components/SiteSelector'
import { DateFilter as DateFilterPicker } from '@/lib/components/DateFilter'
import { DateFilter } from '@/lib/types/insights'
import { useState } from 'react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useTopEvents } from '@/lib/hooks/useInsights'

export default function TopEventsPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('MONTH')
  const {
    selectedSiteKey,
    setSelectedSiteKey,
    isLoading: sitesLoading,
  } = useSiteContext()
  const { data, isLoading } = useTopEvents(selectedSiteKey || '', {
    limit: 20,
    dateFilter,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Top Events</h1>
          <p className="text-muted-foreground">
            Eventos mais frequentes por site
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilterPicker value={dateFilter} onChange={setDateFilter} />
          <div className="w-64">
            <SiteSelector
              value={selectedSiteKey}
              onValueChange={setSelectedSiteKey}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
        </CardHeader>
        <CardContent>
          {sitesLoading || isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="text-sm">
              {data?.events?.length ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Event</th>
                      <th className="py-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.map((e) => (
                      <tr key={e.name} className="border-b">
                        <td className="py-2">{e.name}</td>
                        <td className="py-2 text-right font-medium">
                          {e.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
