'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteSite } from '@/lib/hooks/useSites';

export function DeleteSiteButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const deleteSiteMutation = useDeleteSite();

  const handleDelete = async () => {
    if (!confirm("Delete this site? This cannot be undone.")) return;

    try {
      await deleteSiteMutation.mutateAsync(siteId);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete site:', error);
      alert("Failed to delete site");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deleteSiteMutation.isPending}
      aria-label="Delete site"
      title="Delete site"
      className="text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 />
    </Button>
  );
}


