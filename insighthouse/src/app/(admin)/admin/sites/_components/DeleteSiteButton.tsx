'use client'

import { useRouter } from 'next/navigation'

export function DeleteSiteButton({ siteId }: { siteId: string }) {
  const router = useRouter()
  const onDelete = async () => {
    if (!confirm('Delete this site? This cannot be undone.')) return
    try {
      const r = await fetch(`/api/sites/${siteId}`, { method: 'DELETE' })
      if (r.ok) {
        router.refresh()
      } else {
        alert('Failed to delete')
      }
    } catch {
      alert('Failed to delete')
    }
  }
  return (
    <button onClick={onDelete} className="text-red-600 underline">Delete</button>
  )
}


