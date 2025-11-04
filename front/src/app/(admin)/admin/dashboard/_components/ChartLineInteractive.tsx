'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card'
import { Button } from '@/lib/components/ui/button'

export function ChartLineInteractive() {
  return (
    <Card className="py-4 sm:py-0">
      <CardHeader>
        <CardTitle>Time Series Analytics</CardTitle>
        <CardDescription>
          Historical data visualization will be available here
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[250px] gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Time series data visualization is coming soon. For now, explore
          categorized insights.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/insights">View Categorized Insights</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
