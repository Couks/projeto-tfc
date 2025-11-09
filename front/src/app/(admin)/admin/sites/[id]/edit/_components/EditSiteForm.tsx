'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { Input } from '@ui/input'
import { Button } from '@ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@ui/select'
import { Alert, AlertDescription } from '@ui/alert'
import { Building2, Activity } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@ui/spinner'
import { useUpdateSite } from '@/lib/hooks'

export function EditSiteForm({
  site,
}: {
  site: { id: string; name: string; status: 'active' | 'inactive' }
}) {
  const router = useRouter()
  const updateSiteMutation = useUpdateSite()
  const [status, setStatus] = React.useState<'active' | 'inactive'>(site.status)

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string

    try {
      await updateSiteMutation.mutateAsync({
        siteId: site.id,
        data: { name, status },
      })
      router.push('/admin/sites')
    } catch (error) {
      console.error('Failed to update site:', error)
    }
  }
  return (
    <form className="space-y-6" onSubmit={onSave}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="site-name"
            className="text-sm font-medium text-muted-foreground flex items-center gap-2"
          >
            <Building2 className="h-3.5 w-3.5" />
            Nome do Site
          </label>
          <Input
            id="site-name"
            name="name"
            defaultValue={site.name}
            placeholder="Nome do site"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="site-status"
            className="text-sm font-medium text-muted-foreground flex items-center gap-2"
          >
            <Activity className="h-3.5 w-3.5" />
            Status
          </label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as 'active' | 'inactive')}
          >
            <SelectTrigger id="site-status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
      </div>

      {updateSiteMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateSiteMutation.error instanceof Error
              ? updateSiteMutation.error.message
              : 'Falha ao atualizar site'}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3 pt-2 border-t">
        <Button
          type="submit"
          disabled={updateSiteMutation.isPending}
          className="min-w-[120px]"
        >
          {updateSiteMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
          {updateSiteMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/admin/sites">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
