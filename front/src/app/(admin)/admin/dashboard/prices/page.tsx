'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { PricesChart } from './_components/PricesChart'
import { useSites, usePrices } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'

export default function PricesPage() {
  const { data: sites, isLoading: sitesLoading } = useSites()
  const firstSite = sites?.[0]

  const { data, isLoading: dataLoading } = usePrices(firstSite?.siteKey || '')

  const isLoading = sitesLoading || dataLoading

  // Calculate metrics from real data (sale prices)
  const totalSearches =
    data?.reduce((sum: number, item) => sum + item.searches, 0) || 0

  // Get top 3 price ranges
  const topPrices = data?.slice(0, 3) || []

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
        <h1 className="text-2xl font-semibold">Faixas de Preço</h1>
        <p className="text-muted-foreground">
          Faixas de preço mais utilizadas nas pesquisas
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Faixa de Preço (Venda)</CardTitle>
          </CardHeader>
          <CardContent>
            <PricesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPrices.map((price, index: number) => {
            const priceRange = price.range || 'N/A'
            const priceCount = price.searches || 0
            const pricePercentage =
              totalSearches > 0
                ? ((priceCount / totalSearches) * 100).toFixed(1)
                : '0'

            const labels = [
              'mais popular',
              'segunda mais popular',
              'terceira mais popular',
            ]

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{priceRange}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(pricePercentage) > 0
                      ? `${pricePercentage}%`
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {priceCount > 0
                      ? `${labels[index]} (${priceCount} pesquisas)`
                      : 'Aguardando dados'}
                  </p>
                </CardContent>
              </Card>
            )
          })}

          {/* Fill with empty cards if less than 3 price ranges */}
          {Array.from({
            length: Math.max(0, 3 - topPrices.length),
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
