'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { PurposesChart } from './_components/PurposesChart'
import { useSites, usePurposes } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'

export default function PurposesPage() {
  const { data: sites, isLoading: sitesLoading } = useSites()
  const firstSite = sites?.[0]

  const { data, isLoading: dataLoading } = usePurposes(firstSite?.siteKey || '')

  const isLoading = sitesLoading || dataLoading

  // Calculate metrics from real data
  const totalSearches =
    data?.reduce((sum: number, item) => sum + item.value, 0) || 0

  // Get top 3 purposes
  const topPurposes = data?.slice(0, 3) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finalidades</h1>
        <p className="text-muted-foreground">
          Finalidades mais buscadas pelos usuários
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Finalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <PurposesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPurposes.map((purpose, index: number) => {
            const purposeName = purpose.name || 'N/A'
            const purposeCount = purpose.value || 0
            const purposePercentage =
              totalSearches > 0
                ? ((purposeCount / totalSearches) * 100).toFixed(1)
                : '0'

            const labels = [
              'mais buscada',
              'segunda mais buscada',
              'terceira mais buscada',
            ]

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{purposeName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(purposePercentage) > 0
                      ? `${purposePercentage}%`
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {purposeCount > 0
                      ? `${labels[index]} (${purposeCount} pesquisas)`
                      : 'Aguardando dados'}
                  </p>
                </CardContent>
              </Card>
            )
          })}

          {/* Fill with empty cards if less than 3 purposes */}
          {Array.from({
            length: Math.max(0, 3 - topPurposes.length),
          }).map((_, i) => (
            <Card key={`empty-${i}`}>
              <CardHeader>
                <CardTitle className="text-base">-</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">N/A</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando dados
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
