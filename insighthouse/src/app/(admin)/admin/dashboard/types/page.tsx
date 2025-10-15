import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { TypesChart } from "./_components/TypesChart";

export default async function TypesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tipos de Imóveis</h1>
        <p className="text-muted-foreground">
          Tipos de imóveis mais buscados pelos usuários
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <TypesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apartamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45.2%</div>
              <p className="text-xs text-muted-foreground">
                Tipo mais buscado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Casas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32.8%</div>
              <p className="text-xs text-muted-foreground">
                Segundo mais buscado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comerciais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22.0%</div>
              <p className="text-xs text-muted-foreground">
                Terceiro mais buscado
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
