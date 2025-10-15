'use client'

import { useRouter } from 'next/navigation'
import * as React from "react";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@ui/select";
import Link from "next/link";

export function EditSiteForm({
  site,
}: {
  site: { id: string; name: string; status: "active" | "inactive" };
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState<"active" | "inactive">(
    site.status
  );
  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = { name: fd.get("name"), status };
    const r = await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) router.push("/admin/sites");
    else alert("Failed to update");
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
            onValueChange={(v) => setStatus(v as "active" | "inactive")}
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
        <Button type="submit" size="sm">
          Salvar
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/sites">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}


