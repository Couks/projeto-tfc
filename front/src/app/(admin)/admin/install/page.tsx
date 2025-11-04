'use client'

import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip'
import { Skeleton } from '@ui/skeleton'
import { CopySnippetButton } from './_components/CopySnippetButton'
import { useSites } from '@/lib/hooks'
import {
  Code,
  CheckCircle2,
  AlertCircle,
  Globe,
  Plus,
  Lightbulb,
} from 'lucide-react'

export default function InstallPage() {
  const { data: sites, isLoading, error } = useSites()
  const firstSite = sites?.[0]
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const loaderUrl = firstSite
    ? `${base}/api/sdk/loader?site=${encodeURIComponent(firstSite.siteKey)}`
    : ''

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Código de Instalação
          </h1>
          <p className="text-muted-foreground text-lg">
            Integre o rastreamento de analytics ao seu site
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar sites</AlertTitle>
          <AlertDescription>
            Não foi possível carregar suas configurações. Verifique sua conexão
            e tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!firstSite) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Código de Instalação
          </h1>
          <p className="text-muted-foreground text-lg">
            Integre o rastreamento de analytics ao seu site
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum site configurado</AlertTitle>
          <AlertDescription>
            Você precisa criar um site antes de obter o código de instalação.
          </AlertDescription>
        </Alert>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Configure seu primeiro site
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Adicione seu site para receber o código de rastreamento e
                começar a coletar dados de analytics.
              </p>
              <Button asChild>
                <Link href="/admin/sites/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Site
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Código de Instalação
        </h1>
        <p className="text-muted-foreground text-lg">
          Integre o rastreamento de analytics ao seu site
        </p>
      </div>

      {/* Installation snippet */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <CardTitle>Script de Rastreamento</CardTitle>
          </div>
          <CardDescription>
            Copie e cole este código no{' '}
            <code className="bg-muted px-1 rounded">{'<head>'}</code> do seu
            site ou adicione via Google Tag Manager
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Site configurado:</span>
              <Badge>{firstSite.name}</Badge>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <pre className="p-4 bg-muted border rounded-lg text-sm overflow-auto font-mono">
                      {`<script async src="${loaderUrl}"></script>`}
                    </pre>
                    <div className="absolute top-3 right-3">
                      <CopySnippetButton
                        snippet={`<script async src="${loaderUrl}"></script>`}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para copiar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Installation instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Como Instalar</CardTitle>
          </div>
          <CardDescription>
            Escolha o método de instalação que melhor se adequa ao seu site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Method 1: Direct HTML */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </div>
                <h3 className="font-semibold">Instalação Direta no HTML</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-8">
                Cole o código acima dentro da tag{' '}
                <code className="bg-muted px-1 rounded">{'<head>'}</code> do seu
                site, preferencialmente logo após a abertura da tag.
              </p>
              <pre className="ml-8 p-3 bg-muted border rounded text-xs overflow-auto font-mono">
                {`<!DOCTYPE html>
<html>
  <head>
    <script async src="${loaderUrl}"></script>
    <!-- Resto do seu código -->
  </head>
  <body>
    ...
  </body>
</html>`}
              </pre>
            </div>

            {/* Method 2: Google Tag Manager */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  2
                </div>
                <h3 className="font-semibold">Via Google Tag Manager</h3>
              </div>
              <div className="pl-8 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Se você usa GTM, siga estes passos:
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Acesse seu container no Google Tag Manager</li>
                  <li>
                    Crie uma nova tag do tipo &quot;HTML Personalizado&quot;
                  </li>
                  <li>Cole o código do script no campo HTML</li>
                  <li>Configure o acionador para &quot;All Pages&quot;</li>
                  <li>Salve e publique o container</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Dicas Importantes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>
                O script é assíncrono e não afeta a velocidade de carregamento
                do seu site
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>
                Aguarde algumas horas após a instalação para começar a ver dados
                nas análises
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>
                O rastreamento funciona automaticamente em todas as páginas do
                seu site
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>
                Você pode testar a instalação abrindo o console do navegador e
                verificando se há erros
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/sites">
            <Globe className="h-4 w-4 mr-2" />
            Gerenciar Sites
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/insights">Ver Análises</Link>
        </Button>
      </div>
    </div>
  )
}
