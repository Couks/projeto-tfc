"use client";

import { Alert, AlertDescription } from "@ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { Skeleton } from "@ui/skeleton";
import { CopySnippetButton } from "./_components/CopySnippetButton";
import { useSites } from "@/lib/hooks";

export default function InstallPage() {
  const { data: sites, isLoading, error } = useSites();
  const firstSite = sites?.[0];
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  const loaderUrl = firstSite
    ? `${base}/api/sdk/loader?site=${encodeURIComponent(firstSite.siteKey)}`
    : "";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Instalação</h1>
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar sites. Verifique sua conexão e tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Instalação</h1>
      {firstSite ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Snippet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              Cole este snippet no seu site (GTM ou HTML):
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <pre className="p-3 bg-muted border rounded text-sm overflow-auto">{`<script async src="${loaderUrl}"></script>`}</pre>
                    <div className="absolute top-2 right-2">
                      <CopySnippetButton
                        snippet={`<script async src="${loaderUrl}"></script>`}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copie e cole no seu site</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertDescription>Crie um Site primeiro.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
