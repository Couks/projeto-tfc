import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Spinner } from '@ui/spinner'
import {
  BarChart3,
  Target,
  Building2,
  Smartphone
} from 'lucide-react'

interface ChartCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
  children: React.ReactNode
}

function ChartCard({ title, description, icon: Icon, isLoading, children }: ChartCardProps) {
  return (
    <Card className="shadow-inner-3">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner className="w-4 h-4" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

interface InsightsSummaryChartsProps {
  topCities?: Array<{ cidade: string; count: number }>
  conversionsByType?: Array<{ type: string; count: number }>
  topProperties?: Array<{ propertyCode: string; views: number; favorites: number }>
  topDevices?: Array<{ deviceType: string; count: number }>
  isLoadingSearch?: boolean
  isLoadingConversion?: boolean
  isLoadingProperty?: boolean
  isLoadingDevices?: boolean
}

export function InsightsSummaryCharts({
  topCities,
  conversionsByType,
  topProperties,
  topDevices,
  isLoadingSearch,
  isLoadingConversion,
  isLoadingProperty,
  isLoadingDevices,
}: InsightsSummaryChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard
        title="Top 5 Cidades"
        description="Cidades mais buscadas"
        icon={BarChart3}
        isLoading={isLoadingSearch}
      >
        {topCities && topCities.length > 0 ? (
          <div className="space-y-2">
            {topCities.slice(0, 5).map((city, index) => {
              const maxCount = topCities[0]?.count || 1
              const widthPercent = (city.count / maxCount) * 100
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{city.cidade}</span>
                    <span className="text-muted-foreground">{city.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Conversões por Tipo"
        description="Tipos de conversão"
        icon={Target}
        isLoading={isLoadingConversion}
      >
        {conversionsByType && conversionsByType.length > 0 ? (
          <div className="space-y-2">
            {conversionsByType.map((type, index) => {
              const maxCount = conversionsByType[0]?.count || 1
              const widthPercent = (type.count / maxCount) * 100
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{type.type}</span>
                    <span className="text-muted-foreground">{type.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Top 5 Imóveis"
        description="Imóveis mais visualizados"
        icon={Building2}
        isLoading={isLoadingProperty}
      >
        {topProperties && topProperties.length > 0 ? (
          <div className="space-y-3">
            {topProperties.slice(0, 5).map((property, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">#{property.propertyCode}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.favorites} favoritos
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{property.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">visualizações</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Dispositivos"
        description="Acessos por dispositivo"
        icon={Smartphone}
        isLoading={isLoadingDevices}
      >
        {topDevices && topDevices.length > 0 ? (
          <div className="space-y-2">
            {topDevices.slice(0, 5).map((device, index) => {
              const maxCount = topDevices[0]?.count || 1
              const widthPercent = (device.count / maxCount) * 100
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{device.deviceType}</span>
                    <span className="text-muted-foreground">{device.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </ChartCard>
    </div>
  )
}

