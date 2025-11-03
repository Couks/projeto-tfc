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
import Link from 'next/link'
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
    <form className="space-y-3" onSubmit={onSave}>
      <div>
        <label htmlFor="site-name" className="block text-sm font-medium">
          Nome do Site
        </label>
        <Input
          id="site-name"
          name="name"
          defaultValue={site.name}
          className="mt-1"
          placeholder="Site name"
        />
      </div>
      <div>
        <label htmlFor="site-status" className="block text-sm font-medium">
          Status
        </label>
        <div className="mt-1">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as 'active' | 'inactive')}
          >
            <SelectTrigger id="site-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={updateSiteMutation.isPending}>
          {updateSiteMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/sites">Cancelar</Link>
        </Button>
      </div>

      {updateSiteMutation.isError && (
        <div className="text-sm text-red-600">
          {updateSiteMutation.error instanceof Error
            ? updateSiteMutation.error.message
            : 'Falha ao atualizar site'}
        </div>
      )}
    </form>
  )
}
