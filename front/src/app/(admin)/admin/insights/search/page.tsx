'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Skeleton } from '@ui/skeleton'
import { Spinner } from '@ui/spinner'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  useSearchSummary,
  useFiltersUsage,
  useTopConvertingFilters,
} from '@/lib/hooks/useInsights'
import { TrendingUp, MapPin, Home, Target, Filter } from 'lucide-react'
import { TopFinalidadesChart } from './_components/TopFinalidadesChart'
import { TopCidadesChart } from './_components/TopCidadesChart'
import { TopConvertingFiltersTable } from './_components/TopConvertingFiltersTable'

export default function SearchAnalyticsPage() {
  const { selectedSiteKey } = useSiteContext()
  const { data: searchData, isLoading: searchLoading } = useSearchSummary(
    selectedSiteKey || ''
  )
  const { data: filtersData, isLoading: filtersLoading } = useFiltersUsage(
    selectedSiteKey || ''
  )
  const {
    data: topConvertingFiltersData,
    isLoading: topConvertingFiltersLoading,
  } = useTopConvertingFilters(selectedSiteKey || '')

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

      {/* Top Row: Grid com 4 cards quadrados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-layer-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Buscas
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
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
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
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

        <Card className="shadow-layer-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mudanças de Filtros
            </CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {filtersData?.totalFilterChanges.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de alterações
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topConvertingFiltersLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {topConvertingFiltersData?.filters.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Filtros que convertem
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Finalidades Chart */}
      <Card className="shadow-layer-5">
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

      {/* Bairros Section */}
      <Card className="shadow-inner-5">
        <CardHeader>
          <CardTitle>Bairros Mais Buscados</CardTitle>
          <CardDescription>
            Localidades específicas de maior interesse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : searchData?.topBairros && searchData.topBairros.length > 0 ? (
            <div className="space-y-2">
              {searchData.topBairros.map((item, index) => (
                <div
                  key={item.bairro}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <p className="font-medium">{item.bairro}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>

      {/* Numeric Filters Row - Residencial */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {/* Quartos */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Quartos Mais Buscados</CardTitle>
            <CardDescription>Número de quartos preferidos</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.topQuartos && searchData.topQuartos.length > 0 ? (
              <div className="space-y-2">
                {searchData.topQuartos.map((item, index) => (
                  <div
                    key={item.quartos}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.quartos} quartos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Suites */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Suítes Mais Buscadas</CardTitle>
            <CardDescription>Número de suítes preferidas</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.topSuites && searchData.topSuites.length > 0 ? (
              <div className="space-y-2">
                {searchData.topSuites.map((item, index) => (
                  <div
                    key={item.suites}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.suites} suítes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Banheiros */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Banheiros Mais Buscados</CardTitle>
            <CardDescription>Número de banheiros preferidos</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.topBanheiros &&
              searchData.topBanheiros.length > 0 ? (
              <div className="space-y-2">
                {searchData.topBanheiros.map((item, index) => (
                  <div
                    key={item.banheiros}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.banheiros} banheiros</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Vagas */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Vagas de Garagem</CardTitle>
            <CardDescription>Número de vagas preferidas</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.topVagas && searchData.topVagas.length > 0 ? (
              <div className="space-y-2">
                {searchData.topVagas.map((item, index) => (
                  <div
                    key={item.vagas}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.vagas} vagas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
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

      {/* Numeric Filters Row - Comercial */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Salas */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Salas Mais Buscadas</CardTitle>
            <CardDescription>
              Número de salas para imóveis comerciais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.topSalas && searchData.topSalas.length > 0 ? (
              <div className="space-y-2">
                {searchData.topSalas.map((item, index) => (
                  <div
                    key={item.salas}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.salas} salas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Galpões */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Galpões Mais Buscados</CardTitle>
            <CardDescription>
              Tamanho de galpões para imóveis comerciais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.topGalpoes && searchData.topGalpoes.length > 0 ? (
              <div className="space-y-2">
                {searchData.topGalpoes.map((item, index) => (
                  <div
                    key={item.galpoes}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.galpoes} galpões</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
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

      {/* Price and Area Ranges */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Faixas de Preço - Venda</CardTitle>
            <CardDescription>
              Distribuição das buscas por faixa de preço para venda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.priceRanges?.venda &&
              searchData.priceRanges.venda.length > 0 ? (
              <div className="space-y-2">
                {searchData.priceRanges.venda.map((item, index) => (
                  <div
                    key={item.range}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">R$ {item.range}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Faixas de Preço - Aluguel</CardTitle>
            <CardDescription>
              Distribuição das buscas por faixa de preço para aluguel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.priceRanges?.aluguel &&
              searchData.priceRanges.aluguel.length > 0 ? (
              <div className="space-y-2">
                {searchData.priceRanges.aluguel.map((item, index) => (
                  <div
                    key={item.range}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">R$ {item.range}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Faixas de Área</CardTitle>
            <CardDescription>
              Distribuição das buscas por faixa de área
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : searchData?.areaRanges && searchData.areaRanges.length > 0 ? (
              <div className="space-y-2">
                {searchData.areaRanges.map((item, index) => (
                  <div
                    key={item.range}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.range} m²</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count.toLocaleString()}</p>
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

      {/* Switches/Filters */}
      <Card className="shadow-inner-5">
        <CardHeader>
          <CardTitle>Filtros Especiais Mais Usados</CardTitle>
          <CardDescription>
            Características específicas mais buscadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : searchData?.topSwitches && searchData.topSwitches.length > 0 ? (
            <div className="space-y-2">
              {searchData.topSwitches.map((item, index) => (
                <div
                  key={item.switch}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <p className="font-medium">{item.switch}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}% das buscas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Sem dados disponíveis</p>
          )}
        </CardContent>
      </Card>

      {/* Amenities Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {/* Comodidades */}
        <Card className="shadow-layer-2">
          <CardHeader>
            <CardTitle>Comodidades</CardTitle>
            <CardDescription>Recursos mais procurados</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : searchData?.topComodidades &&
              searchData.topComodidades.length > 0 ? (
              <div className="space-y-2">
                {searchData.topComodidades.map((item) => (
                  <div
                    key={item.comodidade}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <p className="font-medium text-sm">{item.comodidade}</p>
                    <p className="font-bold text-sm">
                      {item.count.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sem dados disponíveis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Lazer */}
        <Card className="shadow-layer-2">
          <CardHeader>
            <CardTitle>Áreas de Lazer</CardTitle>
            <CardDescription>Espaços de lazer desejados</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : searchData?.topLazer && searchData.topLazer.length > 0 ? (
              <div className="space-y-2">
                {searchData.topLazer.map((item) => (
                  <div
                    key={item.lazer}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <p className="font-medium text-sm">{item.lazer}</p>
                    <p className="font-bold text-sm">
                      {item.count.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sem dados disponíveis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="shadow-layer-2">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Itens de segurança valorizados</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : searchData?.topSeguranca &&
              searchData.topSeguranca.length > 0 ? (
              <div className="space-y-2">
                {searchData.topSeguranca.map((item) => (
                  <div
                    key={item.seguranca}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <p className="font-medium text-sm">{item.seguranca}</p>
                    <p className="font-bold text-sm">
                      {item.count.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sem dados disponíveis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cômodos */}
        <Card className="shadow-layer-2">
          <CardHeader>
            <CardTitle>Cômodos</CardTitle>
            <CardDescription>Cômodos mais desejados</CardDescription>
          </CardHeader>
          <CardContent>
            {searchLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : searchData?.topComodos && searchData.topComodos.length > 0 ? (
              <div className="space-y-2">
                {searchData.topComodos.map((item) => (
                  <div
                    key={item.comodo}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <p className="font-medium text-sm">{item.comodo}</p>
                    <p className="font-bold text-sm">
                      {item.count.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sem dados disponíveis
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters Usage Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Filters by Type */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Filtros por Tipo</CardTitle>
            <CardDescription>
              Distribuição de uso de cada tipo de filtro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtersData?.filtersByType &&
              filtersData.filtersByType.length > 0 ? (
              <div className="space-y-3">
                {filtersData.filtersByType.map((item, index) => (
                  <div key={item.filterType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.filterType}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}% do total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {item.count.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">usos</p>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Top Filter Combinations */}
        <Card className="shadow-layer-3">
          <CardHeader>
            <CardTitle>Combinações de Filtros Populares</CardTitle>
            <CardDescription>
              Padrões comuns de busca dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filtersData?.topFilterCombinations &&
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

      {/* Top Converting Filters */}
      <Card className="shadow-inner-5">
        <CardHeader>
          <CardTitle>Filtros que Mais Convertem</CardTitle>
          <CardDescription>
            Combinações de filtros que geram mais conversões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopConvertingFiltersTable
            data={topConvertingFiltersData}
            isLoading={topConvertingFiltersLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
