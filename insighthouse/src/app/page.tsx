import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl py-10 px-4 space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Insighthouse</h1>
        <p className="text-muted-foreground">
          SaaS de analytics para sites imobiliários. Colete eventos de busca
          (filtros, cidade, faixas de preço, etc.) com um loader first‑party e
          visualize insights prontos em um painel administrativo.
        </p>
        <div>
          <Button asChild>
            <Link href="/login">Entrar na dashboard</Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
          <CardDescription>Visão geral do fluxo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            1) Configure um <span className="font-medium">Site</span> e domínios
            permitidos.
          </p>
          <p>
            2) Injete o <span className="font-medium">loader</span> no seu site
            para capturar eventos.
          </p>
          <p>
            3) Consulte a <span className="font-medium">dashboard</span> para
            insights por cidade, filtros e conversões.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
