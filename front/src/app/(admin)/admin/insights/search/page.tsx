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
import { useSearchAnalytics, useFiltersUsage } from '@/lib/hooks/useInsights'
import { TrendingUp, MapPin, Home, Target } from 'lucide-react'

export default function SearchAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: searchData, isLoading: searchLoading } = useSearchAnalytics(
    selectedSiteKey || ''
  )
  const { data: filtersData, isLoading: filtersLoading } = useFiltersUsage(
    selectedSiteKey || ''
  )

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
        <h1 className="text-3xl font-bold tracking-tight">Análise de Buscas</h1>
        <p className="text-muted-foreground text-lg">
          Entenda o que seus clientes procuram e otimize seu inventário
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Buscas
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {searchData?.totalSearches.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pesquisas realizadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Filtros por Busca
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {searchData?.avgFiltersUsed.toFixed(1) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média de filtros utilizados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mudanças de Filtro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {filtersData?.totalFilterChanges.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alterações realizadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Finalidade Líder
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {searchData?.topFinalidades[0]?.finalidade || 'N/A'}
                </div>
                {searchData?.topFinalidades[0] && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchData.topFinalidades[0].count} buscas
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prioridade Alta: Finalidades e Cidades */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Finalidades */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <CardTitle>Finalidades Mais Buscadas</CardTitle>
            </div>
            <CardDescription>
              Priorize imóveis para essas finalidades em suas campanhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {searchData?.topFinalidades.map((item, index) => (
                  <div
                    key={item.finalidade}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{item.finalidade}</p>
                        <p className="text-xs text-muted-foreground">
                          {(
                            (item.count / (searchData?.totalSearches || 1)) *
                            100
                          ).toFixed(1)}
                          % do total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {item.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">buscas</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Cidades */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Cidades Mais Buscadas</CardTitle>
            </div>
            <CardDescription>
              Concentre seu inventário nessas localidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {searchData?.topCidades.map((item, index) => (
                  <div
                    key={item.cidade}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{item.cidade}</p>
                        <p className="text-xs text-muted-foreground">
                          {(
                            (item.count / (searchData?.totalSearches || 1)) *
                            100
                          ).toFixed(1)}
                          % do total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {item.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">buscas</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Complementares */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Tipos */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Imóveis</CardTitle>
            <CardDescription>Categorias mais procuradas</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {searchData?.topTipos.map((item, index) => (
                  <div
                    key={item.tipo}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Uso de Filtros por Tipo</CardTitle>
            <CardDescription>
              Filtros mais utilizados pelos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtersData?.filtersByType.map((item, index) => (
                  <div
                    key={item.filterType}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{item.filterType}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% de todos os filtros
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Filter Combinations */}
      {filtersData?.topFilterCombinations &&
        filtersData.topFilterCombinations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Combinações de Filtros Populares</CardTitle>
              <CardDescription>
                Padrões comuns de busca dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filtersData.topFilterCombinations.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium text-sm">
                        {item.combination.join(' + ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">usos</p>
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
