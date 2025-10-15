import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { FunnelChart } from "./_components/FunnelChart";

export default async function FunnelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Funil de Conversão</h1>
        <p className="text-muted-foreground">
          Análise do funil de conversão dos visitantes
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-muted-foreground">
                +0.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visitantes Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +5.2% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leads Gerados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">39</div>
              <p className="text-xs text-muted-foreground">
                +2.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
