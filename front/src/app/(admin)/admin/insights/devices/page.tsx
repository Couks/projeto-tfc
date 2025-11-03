'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { SiteSelector } from '@/lib/components/SiteSelector'
import { DateFilter as DateFilterPicker } from '@/lib/components/DateFilter'
import { DateFilter } from '@/lib/types/insights'
import { useState } from 'react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useDevices } from '@/lib/hooks/useInsights'

export default function DevicesPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('MONTH')
  const {
    selectedSiteKey,
    setSelectedSiteKey,
    isLoading: sitesLoading,
  } = useSiteContext()
  const { data, isLoading } = useDevices(selectedSiteKey || '', {
    dateFilter,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Devices</h1>
          <p className="text-muted-foreground">
            Distribuição por dispositivo, sistema e navegador
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
          <CardTitle>Device Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {sitesLoading || isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="text-sm">
              {data?.deviceDistribution?.length ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Device</th>
                      <th className="py-2">OS</th>
                      <th className="py-2">Browser</th>
                      <th className="py-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deviceDistribution.map((d, idx) => (
                      <tr
                        key={`${d.deviceType}-${d.os}-${d.browser}-${idx}`}
                        className="border-b"
                      >
                        <td className="py-2">{d.deviceType}</td>
                        <td className="py-2">{d.os}</td>
                        <td className="py-2">{d.browser}</td>
                        <td className="py-2 text-right font-medium">
                          {d.count.toLocaleString()}
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
