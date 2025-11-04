'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Skeleton } from '@/lib/components/ui/skeleton'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useSearchAnalytics, useFiltersUsage } from '@/lib/hooks/useInsights'

export default function SearchAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: searchData, isLoading: searchLoading } = useSearchAnalytics(selectedSiteKey || '')
  const { data: filtersData, isLoading: filtersLoading } = useFiltersUsage(selectedSiteKey || '')

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
        <h1 className="text-3xl font-bold">Search Analytics</h1>
        <p className="text-muted-foreground">
          Analyze search behavior and filter usage patterns
        </p>
      </div>

      {/* Search Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{searchData?.totalSearches.toLocaleString() || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Filters Used</CardTitle>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{searchData?.avgFiltersUsed.toFixed(2) || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filter Changes</CardTitle>
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{filtersData?.totalFilterChanges.toLocaleString() || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Finalidade</CardTitle>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{searchData?.topFinalidades[0]?.finalidade || 'N/A'}</div>
            )}
            {searchData?.topFinalidades[0] && (
              <p className="text-xs text-muted-foreground mt-1">
                {searchData.topFinalidades[0].count} searches
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Finalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Top Finalidades</CardTitle>
          <CardDescription>Most searched property purposes</CardDescription>
        </CardHeader>
        <CardContent>
          {searchLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {searchData?.topFinalidades.map((item, index) => (
                <div key={item.finalidade} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.finalidade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">searches</p>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Tipos */}
      <Card>
        <CardHeader>
          <CardTitle>Top Property Types</CardTitle>
          <CardDescription>Most searched property types</CardDescription>
        </CardHeader>
        <CardContent>
          {searchLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {searchData?.topTipos.map((item, index) => (
                <div key={item.tipo} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">searches</p>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Cidades */}
      <Card>
        <CardHeader>
          <CardTitle>Top Cities</CardTitle>
          <CardDescription>Most searched cities</CardDescription>
        </CardHeader>
        <CardContent>
          {searchLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {searchData?.topCidades.map((item, index) => (
                <div key={item.cidade} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.cidade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">searches</p>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Usage by Type</CardTitle>
          <CardDescription>Which filters users interact with most</CardDescription>
        </CardHeader>
        <CardContent>
          {filtersLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtersData?.filtersByType.map((item, index) => (
                <div key={item.filterType} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.filterType}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}% of all filters</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">changes</p>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No data available</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Filter Combinations */}
      {filtersData?.topFilterCombinations && filtersData.topFilterCombinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Filter Combinations</CardTitle>
            <CardDescription>Commonly used filter combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filtersData.topFilterCombinations.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.combination.join(' + ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">uses</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

