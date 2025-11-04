import { Skeleton } from '@/lib/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card'

export default function NewSiteLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      {/* Form Card Skeleton */}
      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

