'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@ui/button'

export function RefreshButton() {
  const router = useRouter()
  return (
    <Button size="sm" variant="outline" onClick={() => router.refresh()}>
      Atualizar
    </Button>
  )
}
