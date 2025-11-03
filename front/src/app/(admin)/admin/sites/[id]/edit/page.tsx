'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { EditSiteForm } from './_components/EditSiteForm'
import { useSite } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'

export default function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [siteId, setSiteId] = React.useState<string | null>(null)

  React.useEffect(() => {
    params.then(({ id }) => setSiteId(id))
  }, [params])

  const { data: site, isLoading, error } = useSite(siteId || '')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-red-600">Site not found.</div>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/sites">Back</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar Site</h1>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/sites">Voltar</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Site</CardTitle>
        </CardHeader>
        <CardContent>
          <EditSiteForm
            site={{
              id: site.id,
              name: site.name,
              status: site.status as 'active' | 'inactive',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
