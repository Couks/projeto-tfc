'use client';
import { useState } from 'react';
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Alert, AlertDescription } from "@ui/alert";
import { apiClient } from "@/lib/api";

export default function NewSitePage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [loaderUrl, setLoaderUrl] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoaderUrl(null);
    setSiteKey(null);
    try {
      const data = await apiClient.post<{ loaderUrl: string; siteKey: string }>(
        "/api/sites",
        { name, domain }
      );
      setLoaderUrl(data.loaderUrl);
      setSiteKey(data.siteKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
            <Button type="submit" size="sm">
              Criar
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {loaderUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Snippet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Use este snippet HTML:
            </div>
            <pre className="mt-2 p-3 bg-muted border rounded text-sm overflow-auto">
              {htmlSnippet}
            </pre>
            <div className="text-sm text-muted-foreground mt-2">
              Ou adicione via GTM (Custom HTML tag): o mesmo snippet acima.
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              SITE_KEY: {siteKey}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


