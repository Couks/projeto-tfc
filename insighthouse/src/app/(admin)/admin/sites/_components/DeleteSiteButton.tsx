'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@ui/button";
import { Trash2 } from "lucide-react";

export function DeleteSiteButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const onDelete = async () => {
    if (!confirm("Delete this site? This cannot be undone.")) return;
    try {
      const r = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      if (r.ok) {
        router.refresh();
      } else {
        alert("Failed to delete");
      }
    } catch {
      alert("Failed to delete");
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onDelete}
      aria-label="Delete site"
      title="Delete site"
      className="text-red-600 hover:text-red-700"
    >
      <Trash2 />
    </Button>
  );
}


