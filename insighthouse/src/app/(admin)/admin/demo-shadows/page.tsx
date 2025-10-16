import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { ThemeToggle } from "@/lib/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ShadowDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Voltar</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-light text-foreground">Sistema de Profundidade</h1>
            <p className="text-muted-foreground">
              Demonstração das sombras em camadas para criar profundidade visual
            </p>
          </div>

          {/* Shadow Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Layer 0 - No Shadow */}
            <Card className="shadow-layer-0">
              <CardHeader>
                <CardTitle className="text-lg">Layer 0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sem sombra - nível base
                </p>
                <div className="mt-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    shadow-layer-0
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Layer 1 - Small Shadow */}
            <Card className="shadow-layer-1">
              <CardHeader>
                <CardTitle className="text-lg">Layer 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sombra pequena - elementos flutuantes leves
                </p>
                <div className="mt-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    shadow-layer-1
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Layer 2 - Medium Shadow */}
            <Card className="shadow-layer-2">
              <CardHeader>
                <CardTitle className="text-lg">Layer 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sombra média - cards e componentes
                </p>
                <div className="mt-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    shadow-layer-2
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Layer 3 - Large Shadow */}
            <Card className="shadow-layer-3">
              <CardHeader>
                <CardTitle className="text-lg">Layer 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sombra grande - modais e overlays
                </p>
                <div className="mt-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    shadow-layer-3
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Layer 4 - Extra Large Shadow */}
            <Card className="shadow-layer-4">
              <CardHeader>
                <CardTitle className="text-lg">Layer 4</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sombra extra grande - elementos de destaque
                </p>
                <div className="mt-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    shadow-layer-4
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Layer 5 - Maximum Shadow */}
            <Card className="shadow-layer-5">
              <CardHeader>
                <CardTitle className="text-lg">Layer 5</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sombra máxima - elementos críticos
                </p>
                <div className="mt-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    shadow-layer-5
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Examples */}
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-foreground">Exemplos Interativos</h2>

            {/* Button Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Botões com Profundidade</h3>
              <div className="flex flex-wrap gap-4">
                <Button className="shadow-layer-0">Layer 0</Button>
                <Button className="shadow-layer-1">Layer 1</Button>
                <Button className="shadow-layer-2">Layer 2</Button>
                <Button className="shadow-layer-3">Layer 3</Button>
              </div>
            </div>

            {/* Nested Cards Example */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Cards Aninhados</h3>
              <div className="p-6 bg-muted/30 rounded-lg shadow-layer-1">
                <div className="p-4 bg-background rounded-lg shadow-layer-2">
                  <div className="p-3 bg-muted/50 rounded-lg shadow-layer-3">
                    <p className="text-sm text-muted-foreground">
                      Exemplo de profundidade em camadas com cards aninhados
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Elementos de Formulário</h3>
              <div className="max-w-md space-y-4">
                <input
                  type="text"
                  placeholder="Input com shadow-layer-1"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg shadow-layer-1 focus:shadow-layer-2 focus:outline-none transition-shadow"
                />
                <select
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg shadow-layer-1 focus:shadow-layer-2 focus:outline-none transition-shadow"
                  aria-label="Select com profundidade"
                >
                  <option>Select com profundidade</option>
                </select>
              </div>
            </div>
          </div>

          {/* Usage Guide */}
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-foreground">Guia de Uso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-layer-1">
                <CardHeader>
                  <CardTitle className="text-lg">Quando Usar Cada Layer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <code className="text-sm font-medium">shadow-layer-0</code>
                    <p className="text-xs text-muted-foreground">Elementos base, sem elevação</p>
                  </div>
                  <div>
                    <code className="text-sm font-medium">shadow-layer-1</code>
                    <p className="text-xs text-muted-foreground">Inputs, botões secundários</p>
                  </div>
                  <div>
                    <code className="text-sm font-medium">shadow-layer-2</code>
                    <p className="text-xs text-muted-foreground">Cards, botões primários</p>
                  </div>
                  <div>
                    <code className="text-sm font-medium">shadow-layer-3</code>
                    <p className="text-xs text-muted-foreground">Modais, dropdowns</p>
                  </div>
                  <div>
                    <code className="text-sm font-medium">shadow-layer-4</code>
                    <p className="text-xs text-muted-foreground">Tooltips, popovers</p>
                  </div>
                  <div>
                    <code className="text-sm font-medium">shadow-layer-5</code>
                    <p className="text-xs text-muted-foreground">Elementos críticos, alerts</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-layer-1">
                <CardHeader>
                  <CardTitle className="text-lg">Classes Tailwind</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    shadow-layer-0
                  </div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    shadow-layer-1
                  </div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    shadow-layer-2
                  </div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    shadow-layer-3
                  </div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    shadow-layer-4
                  </div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    shadow-layer-5
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
