'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { ChartBarDefault } from './ChartBarDefault'

export function DashboardClient() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Insights</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartBarDefault />

        <Card>
          <CardHeader>
            <CardTitle>Categorized Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Access detailed analytics by category through the Insights
              Dashboard.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/insights">Go to Insights Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>🔍 Search Analytics</div>
              <div>🎯 Conversion Analytics</div>
              <div>🏢 Properties Analytics</div>
              <div>📝 Forms Analytics</div>
              <div>💫 Engagement Analytics</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
