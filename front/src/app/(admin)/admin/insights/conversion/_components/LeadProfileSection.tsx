'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Spinner } from '@ui/spinner'
import { Skeleton } from '@ui/skeleton'
import { TrendingUp, DollarSign, MapPin, Home, Tag } from 'lucide-react'
import type { LeadProfileResponse } from '@/lib/types/insights'

interface LeadProfileSectionProps {
  data: LeadProfileResponse | undefined
  isLoading: boolean
}

export function LeadProfileSection({
  data,
  isLoading,
}: LeadProfileSectionProps) {
  return (
    <div className="space-y-6">
      {/* Average Values */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-layer-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Médio de Venda
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  R${' '}
                  {data?.averageSaleValue
                    ? data.averageSaleValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '0,00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média dos imóveis convertidos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-layer-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Médio de Aluguel
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Spinner className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  R${' '}
                  {data?.averageRentalValue
                    ? data.averageRentalValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '0,00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média dos imóveis convertidos
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Interests and Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-layer-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Principais Interesses</CardTitle>
            </div>
            <CardDescription>
              Finalidades mais procuradas pelos leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.topInterests && data.topInterests.length > 0 ? (
              <div className="space-y-2">
                {data.topInterests.map((item, index) => (
                  <div
                    key={item.interest}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.interest}</p>
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
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Categorias Mais Procuradas</CardTitle>
            </div>
            <CardDescription>
              Categorias de imóveis preferidas pelos leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.topCategories && data.topCategories.length > 0 ? (
              <div className="space-y-2">
                {data.topCategories.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.category}</p>
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

      {/* Top Property Types and Cities */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-layer-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <CardTitle>Tipos de Imóveis</CardTitle>
            </div>
            <CardDescription>
              Tipos de imóveis mais procurados pelos leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.topPropertyTypes && data.topPropertyTypes.length > 0 ? (
              <div className="space-y-2">
                {data.topPropertyTypes.map((item, index) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.type}</p>
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
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Cidades Mais Procuradas</CardTitle>
            </div>
            <CardDescription>
              Localidades preferidas pelos leads que convertem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.topCities && data.topCities.length > 0 ? (
              <div className="space-y-2">
                {data.topCities.map((item, index) => (
                  <div
                    key={item.city}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item.city}</p>
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
    </div>
  )
}

