import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { PricesChart } from "./_components/PricesChart";

export default async function PricesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Faixas de Preço</h1>
        <p className="text-muted-foreground">
          Faixas de preço mais utilizadas nas pesquisas
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Faixa de Preço</CardTitle>
          </CardHeader>
          <CardContent>
            <PricesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">R$ 200k - R$ 500k</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35.2%</div>
              <p className="text-xs text-muted-foreground">
                Faixa mais popular
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">R$ 500k - R$ 1M</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.7%</div>
              <p className="text-xs text-muted-foreground">
                Segunda mais popular
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">R$ 100k - R$ 200k</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.9%</div>
              <p className="text-xs text-muted-foreground">
                Terceira mais popular
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
