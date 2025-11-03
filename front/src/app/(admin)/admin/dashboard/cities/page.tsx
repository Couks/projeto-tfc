'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { CitiesChart } from './_components/CitiesChart'
import { useSites, useTopCities } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'

export default function CitiesPage() {
  const { data: sites, isLoading: sitesLoading } = useSites()
  const firstSite = sites?.[0]

  const { data: citiesData, isLoading: dataLoading } = useTopCities(
    firstSite?.siteKey || ''
  )

  const isLoading = sitesLoading || dataLoading

  // Calculate real metrics from cities data
  const totalSearches =
    citiesData?.cities?.reduce(
      (sum: number, item: { city: string; count: number }) => sum + item.count,
      0
    ) || 0

  const uniqueCities = citiesData?.cities?.length || 0

  const topCity = citiesData?.cities?.[0]?.city || 'N/A'
  const topCitySearches = citiesData?.cities?.[0]?.count || 0
  const topCityPercentage =
    totalSearches > 0
      ? ((topCitySearches / totalSearches) * 100).toFixed(1)
      : '0'

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
        <h1 className="text-2xl font-semibold">Top Cidades</h1>
        <p className="text-muted-foreground">
          Cidades com maior volume de pesquisas
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Cidades Mais Pesquisadas</CardTitle>
          </CardHeader>
          <CardContent>
            <CitiesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total de Pesquisas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSearches > 0 ? totalSearches.toLocaleString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalSearches > 0
                  ? 'Pesquisas por cidade registradas'
                  : 'Aguardando dados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cidades Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {uniqueCities > 0 ? uniqueCities : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {uniqueCities > 0
                  ? 'Cidades diferentes pesquisadas'
                  : 'Aguardando dados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cidade Líder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCity}</div>
              <p className="text-xs text-muted-foreground">
                {topCitySearches > 0
                  ? `${topCitySearches} pesquisas (${topCityPercentage}%)`
                  : 'Aguardando dados'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
