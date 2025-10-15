import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Alert, AlertDescription } from "@ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";

export default async function InstallPage() {
  const session = await getSession();
  let site: { siteKey: string } | null = null;
  let dbAvailable = true;
  try {
    site = await prisma.site.findFirst({
      where: { userId: session?.userId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    dbAvailable = false;
  }
  const base = process.env.SITE_URL || "";
  const loaderUrl = site
    ? `${base}/api/sdk/loader?site=${encodeURIComponent(site.siteKey)}`
    : "";
  return (
    <div className="space-y-4">
      {!dbAvailable && (
        <Alert variant="destructive">
          <AlertDescription>
            Banco de dados indisponível. Verifique DATABASE_URL/DIRECT_URL e
            rode as migrações.
          </AlertDescription>
        </Alert>
      )}
      <h1 className="text-xl font-semibold">Instalação</h1>
      {site ? (
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
                  <pre className="p-3 bg-muted border rounded text-sm overflow-auto">{`<script async src="${loaderUrl}"></script>`}</pre>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copie e cole no seu site</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="mt-3">
              <Button asChild size="sm">
                <a href={loaderUrl} target="_blank" rel="noreferrer">
                  Abrir Loader
                </a>
              </Button>
            </div>
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


