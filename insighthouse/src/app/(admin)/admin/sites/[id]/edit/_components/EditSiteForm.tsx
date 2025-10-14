'use client'

import { useRouter } from 'next/navigation'

export function EditSiteForm({ site }: { site: { id: string, name: string, status: 'active'|'inactive' } }) {
  const router = useRouter()
  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = { name: fd.get('name'), status: fd.get('status') }
    const r = await fetch(`/api/sites/${site.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) router.push('/admin/sites')
    else alert('Failed to update')
  }
  return (
    <form className="space-y-3" onSubmit={onSave}>
      <div>
        <label htmlFor="site-name" className="block text-sm font-medium">Name</label>
        <input id="site-name" name="name" defaultValue={site.name} className="mt-1 w-full border rounded p-2 text-sm" placeholder="Site name" />
      </div>
      <div>
        <label htmlFor="site-status" className="block text-sm font-medium">Status</label>
        <select id="site-status" name="status" defaultValue={site.status} className="mt-1 w-full border rounded p-2 text-sm">
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="px-3 py-1 rounded bg-black text-white text-sm">Save</button>
      </div>
    </form>
  )
}


