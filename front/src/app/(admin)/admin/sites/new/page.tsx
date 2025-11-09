'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@ui/input'
import { Button } from '@ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Alert, AlertDescription } from '@ui/alert'
import { Spinner } from '@ui/spinner'
import { Globe, Building2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useCreateSite } from '@/lib/hooks'

export default function NewSitePage() {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [loaderUrl, setLoaderUrl] = useState<string | null>(null)
  const [siteKey, setSiteKey] = useState<string | null>(null)
  const router = useRouter()

  const createSiteMutation = useCreateSite()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoaderUrl(null)
    setSiteKey(null)
    try {
      const data = (await createSiteMutation.mutateAsync({
        name,
        domain,
      })) as {
        loaderUrl: string
        siteKey: string
      }
      setLoaderUrl(data.loaderUrl)
      setSiteKey(data.siteKey)

      // Redirect to sites list after successful creation
      setTimeout(() => {
        router.push('/admin/sites')
      }, 2000) // Give user time to see the snippet
    } catch (err) {
      // Error is handled by React Query and displayed via mutation state
    }
  }

  const htmlSnippet = loaderUrl
    ? `<script async src="${loaderUrl}"></script>`
    : ''

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Site</h1>
          <p className="text-muted-foreground text-lg">
            Adicione um novo site para começar a rastrear visitantes e gerar
            insights
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
            Preencha os dados abaixo para criar um novo site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                Nome do Site
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Minha Imobiliária"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Domínio Principal (FQDN)
              </label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.exemplo.com"
                required
              />
            </div>

            {createSiteMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createSiteMutation.error instanceof Error
                    ? createSiteMutation.error.message
                    : 'Falha ao criar site'}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={createSiteMutation.isPending}
                className="min-w-[120px]"
              >
                {createSiteMutation.isPending && (
                  <Spinner className="mr-2 h-4 w-4" />
                )}
                {createSiteMutation.isPending ? 'Criando...' : 'Criar Site'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loaderUrl && (
        <Card className="shadow-layer-4 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              Site Criado com Sucesso!
            </CardTitle>
            <CardDescription>
              Seu site foi criado com sucesso! Você será redirecionado para a
              lista de sites em alguns segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription>
                Copie o snippet abaixo e adicione ao seu site para começar a
                coletar dados.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Snippet HTML
                </label>
                <pre className="p-4 bg-muted/50 border rounded-md text-sm overflow-auto font-mono">
                  {htmlSnippet}
                </pre>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Site Key:</strong> {siteKey}
                </p>
                <p className="pt-1">
                  Você também pode adicionar via GTM (Custom HTML tag) usando o
                  mesmo snippet acima.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/sites')}
              >
                Ver Lista de Sites
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setName('')
                  setDomain('')
                  setLoaderUrl(null)
                  setSiteKey(null)
                }}
              >
                Criar Outro Site
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
