import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog'
import { Card, CardContent } from '@ui/card'
import { Badge } from '@ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export type DetailsDataItem = {
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  percentage?: number
}

export type VisualizationType = 'table' | 'list' | 'chart-bars'

interface DetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  data: DetailsDataItem[]
  visualization?: VisualizationType
  recommendations?: string[]
}

function TrendIndicator({ trend, value }: { trend: 'up' | 'down' | 'neutral'; value?: string }) {
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }
  const colors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  }

  const Icon = icons[trend]
  const colorClass = colors[trend]

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {value && <span className="text-xs">{value}</span>}
    </div>
  )
}

export function DetailsModal({
  open,
  onOpenChange,
  title,
  description,
  data,
  visualization = 'table',
  recommendations,
}: DetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6">
          {/* Data Visualization */}
          {visualization === 'table' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.label}
                        {item.subValue && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.subValue}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.value}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.trend && (
                          <TrendIndicator trend={item.trend} value={item.trendValue} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {visualization === 'list' && (
            <div className="space-y-2">
              {data.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        {item.subValue && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.subValue}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">{item.value}</p>
                          {item.trend && (
                            <TrendIndicator trend={item.trend} value={item.trendValue} />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {visualization === 'chart-bars' && (
            <div className="space-y-3">
              {data.map((item, index) => {
                const maxValue = Math.max(...data.map(d => {
                  const val = typeof d.value === 'number' ? d.value : parseFloat(String(d.value))
                  return isNaN(val) ? 0 : val
                }))
                const itemValue = typeof item.value === 'number' ? item.value : parseFloat(String(item.value))
                const percentage = item.percentage !== undefined
                  ? item.percentage
                  : (maxValue > 0 && !isNaN(itemValue) ? (itemValue / maxValue) * 100 : 0)

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.value}</span>
                        {item.trend && (
                          <TrendIndicator trend={item.trend} value={item.trendValue} />
                        )}
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {item.subValue && (
                      <p className="text-xs text-muted-foreground">{item.subValue}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Recomendações</h3>
                </div>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 shrink-0">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{rec}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

