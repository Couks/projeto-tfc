'use client'

import { useState } from 'react'
import { Button } from '@ui/button'
import { Copy, Check } from 'lucide-react'

export function CopySnippetButton({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onCopy}
      aria-label="Copy snippet"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="sr-only">Copy</span>
    </Button>
  )
}
