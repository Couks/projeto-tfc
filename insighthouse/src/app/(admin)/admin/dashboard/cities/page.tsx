import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { CitiesChart } from "./_components/CitiesChart";

export default async function CitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Top Cidades</h1>
        <p className="text-muted-foreground">
          Cidades com maior volume de pesquisas
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Cidades Mais Pesquisadas</CardTitle>
          </CardHeader>
          <CardContent>
            <CitiesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total de Pesquisas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,456</div>
              <p className="text-xs text-muted-foreground">
                +12.3% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cidades Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +3.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cidade Líder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">São Paulo</div>
              <p className="text-xs text-muted-foreground">
                1,234 pesquisas (14.6%)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
