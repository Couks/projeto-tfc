'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useSearchAnalytics, useFiltersUsage } from '@/lib/hooks/useInsights'
import { TrendingUp, MapPin, Home, Target } from 'lucide-react'
import { TopFinalidadesChart } from './_components/TopFinalidadesChart'
import { TopCidadesChart } from './_components/TopCidadesChart'

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

      {/* Top Row: Grid Assimétrico - 2 cards pequenos à esquerda + 1 card grande com gráfico à direita */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Esquerda: 2 cards pequenos empilhados */}
        <div className="grid gap-4 md:grid-rows-2">
          <Card className="shadow-layer-5">
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

          <Card className="shadow-layer-4">
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
        </div>

        {/* Direita: Card grande com gráfico de finalidades */}
        <Card className="shadow-layer-5 md:col-span-3">
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
            <TopFinalidadesChart data={searchData} isLoading={searchLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Grid 2 colunas - Gráfico de cidades + Lista de tipos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Cidades - Gráfico */}
        <Card className="shadow-layer-4">
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
            <TopCidadesChart data={searchData} isLoading={searchLoading} />
          </CardContent>
        </Card>

        {/* Top Tipos - Lista */}
        <Card className="shadow-layer-3">
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
      </div>

      {/* Bottom Row: Card full-width com tabela de combinações de filtros */}
      <Card className="shadow-layer-2">
        <CardHeader>
          <CardTitle>Combinações de Filtros Populares</CardTitle>
          <CardDescription>
            Padrões comuns de busca dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtersData?.topFilterCombinations &&
          filtersData.topFilterCombinations.length > 0 ? (
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
          ) : (
            <p className="text-muted-foreground">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
