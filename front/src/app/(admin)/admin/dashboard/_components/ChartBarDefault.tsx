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

export const description = 'A bar chart'

export function ChartBarDefault() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>
          Explore detailed analytics by category
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Monthly and historical charts will be available here. For now, explore
          categorized insights.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/insights">View Insights Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
