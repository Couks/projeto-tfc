'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  Search,
  Target,
  Building2,
  FormInput,
  MousePointer,
  ArrowRight,
} from 'lucide-react'

export default function InsightsOverviewPage() {
  const { selectedSiteKey } = useSiteContext()

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Please select a site to view insights
        </p>
      </div>
    )
  }

  const categories = [
    {
      title: 'Search Analytics',
      description: 'Analyze search behavior and filter usage patterns',
      icon: Search,
      href: '/admin/insights/search',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Conversion Analytics',
      description:
        'Track conversion rates, funnel performance, and conversion sources',
      icon: Target,
      href: '/admin/insights/conversion',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Properties Analytics',
      description: 'Track property views, favorites, and user engagement',
      icon: Building2,
      href: '/admin/insights/properties',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Forms Analytics',
      description:
        'Track form completion, abandonment, and field-level insights',
      icon: FormInput,
      href: '/admin/insights/forms',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Engagement Analytics',
      description:
        'Monitor bounce rates, scroll depth, and user engagement metrics',
      icon: MousePointer,
      href: '/admin/insights/engagement',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insights Dashboard</h1>
        <p className="text-muted-foreground">
          Explore categorized analytics to understand your users better
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.href} href={category.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary font-medium">
                    View Details →
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Categorized Insights</CardTitle>
          <CardDescription>How to use this analytics dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">🔍 Search Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Understand what users are looking for with detailed search and
              filter analytics. See top finalidades, property types, cities, and
              filter combinations.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🎯 Conversion Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track your conversion funnel from awareness to action. Monitor
              conversion rates, identify drop-off points, and understand
              conversion sources.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🏢 Properties Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Discover which properties are most popular and how users engage
              with them. Track views, favorites, shares, and CTA performance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📝 Forms Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Optimize your forms with completion and abandonment metrics.
              Identify problematic fields and stages where users drop off.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">💫 Engagement Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Monitor user engagement with bounce rates and scroll depth.
              Understand which pages keep users engaged and which need
              improvement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
