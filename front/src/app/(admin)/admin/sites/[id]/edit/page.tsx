'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { EditSiteForm } from './_components/EditSiteForm'
import { useSite } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'
import { Globe, ArrowLeft } from 'lucide-react'

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
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Site</h1>
          <p className="text-muted-foreground text-lg">Site não encontrado</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-destructive mb-4">
              Não foi possível carregar as informações do site.
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/sites">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Sites
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Site</h1>
          <p className="text-muted-foreground text-lg">
            Atualize as configurações e informações do site
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/sites">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <Card className="shadow-layer-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Informações do Site
          </CardTitle>
          <CardDescription>
            Atualize o nome e o status do site conforme necessário
          </CardDescription>
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
