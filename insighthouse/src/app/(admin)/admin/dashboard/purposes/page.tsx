import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { PurposesChart } from "./_components/PurposesChart";

export default async function PurposesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finalidades</h1>
        <p className="text-muted-foreground">
          Finalidades mais buscadas pelos usuários
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Finalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <PurposesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68.5%</div>
              <p className="text-xs text-muted-foreground">
                Finalidade mais buscada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Locação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.3%</div>
              <p className="text-xs text-muted-foreground">
                Segunda mais buscada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Temporada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-muted-foreground">
                Terceira mais buscada
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
