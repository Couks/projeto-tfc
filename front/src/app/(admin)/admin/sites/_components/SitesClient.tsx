'use client'

import Link from 'next/link'
import { DeleteSiteButton } from './DeleteSiteButton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Alert, AlertDescription } from '@ui/alert'
import { Pencil, Globe, Key, Plus, ExternalLink } from 'lucide-react'
import { Skeleton } from '@ui/skeleton'
import { useSites } from '@/lib/hooks'

export function SitesClient() {
  const { data: sites, isLoading, error } = useSites()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Sites</h1>
          <p className="text-muted-foreground text-lg">
            Configure e monitore seus sites imobiliários
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar sites. Verifique sua conexão e tente novamente.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/admin/sites/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Site
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Sites</h1>
        <p className="text-muted-foreground text-lg">
          Configure e monitore seus sites imobiliários
        </p>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/sites/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Site
          </Link>
        </Button>
      </div>

      {sites?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum site configurado
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Comece adicionando seu primeiro site para começar a rastrear
                visitantes e gerar insights sobre suas campanhas.
              </p>
              <Button asChild>
                <Link href="/admin/sites/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Site
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites?.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-xl">{s.name}</CardTitle>
                      <Badge
                        variant={
                          s.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {s.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {s.siteKey}
                      </code>
                    </CardDescription>
                    {s.domains && s.domains.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span>
                          {s.domains.find((d) => d.isPrimary)?.host ||
                            s.domains[0]?.host}
                        </span>
                        {s.domains.length > 1 && (
                          <Badge variant="outline" className="text-xs">
                            +{s.domains.length - 1} domínios
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      aria-label="Editar site"
                      title="Editar site"
                    >
                      <Link href={`/admin/sites/${s.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteSiteButton siteId={s.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/install">Ver Código de Instalação</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/insights">Ver Análises</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
