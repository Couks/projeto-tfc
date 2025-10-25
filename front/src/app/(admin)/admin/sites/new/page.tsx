'use client';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Alert, AlertDescription } from "@ui/alert";
import { useCreateSite } from "@/lib/hooks";

export default function NewSitePage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [loaderUrl, setLoaderUrl] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const router = useRouter();

  const createSiteMutation = useCreateSite();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoaderUrl(null);
    setSiteKey(null);
    try {
      const data = (await createSiteMutation.mutateAsync({ name, domain })) as {
        loaderUrl: string;
        siteKey: string;
      };
      setLoaderUrl(data.loaderUrl);
      setSiteKey(data.siteKey);

      // Redirect to sites list after successful creation
      setTimeout(() => {
        router.push("/admin/sites");
      }, 2000); // Give user time to see the snippet
    } catch (err) {
      // Error is handled by React Query and displayed via mutation state
    }
  };

  const htmlSnippet = loaderUrl
    ? `<script async src="${loaderUrl}"></script>`
    : "";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Novo Site</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Minha Imobiliária"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">
                Domínio principal (FQDN)
              </label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.exemplo.com"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={createSiteMutation.isPending}
            >
              {createSiteMutation.isPending ? "Criando..." : "Criar"}
            </Button>
            {createSiteMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createSiteMutation.error instanceof Error
                    ? createSiteMutation.error.message
                    : "Falha ao criar site"}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {loaderUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              ✅ Site Criado com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Seu site foi criado com sucesso! Você será redirecionado para a
                lista de sites em alguns segundos.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Use este snippet HTML no seu site:
              </div>
              <pre className="p-3 bg-muted border rounded text-sm overflow-auto">
                {htmlSnippet}
              </pre>
              <div className="text-sm text-muted-foreground">
                Ou adicione via GTM (Custom HTML tag): o mesmo snippet acima.
              </div>
              <div className="text-xs text-muted-foreground">
                SITE_KEY: {siteKey}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/sites")}
              >
                Ver Lista de Sites
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setName("");
                  setDomain("");
                  setLoaderUrl(null);
                  setSiteKey(null);
                }}
              >
                Criar Outro Site
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


