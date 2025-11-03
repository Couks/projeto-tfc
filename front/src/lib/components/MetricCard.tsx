import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { LucideIcon } from 'lucide-react'
import { Skeleton } from '@ui/skeleton'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading = false,
  className,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
          {description && <Skeleton className="h-4 w-32 mt-2" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={`text-xs mt-2 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            {trend.isPositive ? ' aumento' : ' redução'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

MetricCard.displayName = 'MetricCard'
