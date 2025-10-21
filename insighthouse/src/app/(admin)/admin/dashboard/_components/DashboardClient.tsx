'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { RefreshButton } from "./RefreshButton";
import { Table, TableBody, TableCell, TableRow } from "@ui/table";
import { ChartBarDefault } from "./ChartBarDefault";
import { useSites, useOverview, type OverviewData } from '@/lib/hooks';
import { Skeleton } from "@ui/skeleton";

export function DashboardClient() {
  const { data: sites } = useSites();
  const firstSite = sites?.[0];
  const { data, isLoading, error } = useOverview(firstSite?.siteKey || '') as {
    data: OverviewData | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Insights</h1>
          <RefreshButton />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Insights</h1>
          <RefreshButton />
        </div>
        <div className="text-sm text-muted-foreground">
          {error?.message || "Sem dados ainda."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Insights</h1>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartBarDefault />

        <Card>
          <CardHeader>
            <CardTitle>Cidades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.cidades || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.cidades || data.cidades.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.finalidade || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.finalidade || data.finalidade.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.tipos || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.tipos || data.tipos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bairros</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.bairros || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.bairros || data.bairros.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faixas de Preço (Venda)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.preco_venda_ranges || []).map(
                  (r: any[], idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{r[0]}</TableCell>
                      <TableCell>{r[1]}</TableCell>
                    </TableRow>
                  )
                )}
                {(!data.preco_venda_ranges ||
                  data.preco_venda_ranges.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faixas de Preço (Aluguel)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.preco_aluguel_ranges || []).map(
                  (r: any[], idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{r[0]}</TableCell>
                      <TableCell>{r[1]}</TableCell>
                    </TableRow>
                  )
                )}
                {(!data.preco_aluguel_ranges ||
                  data.preco_aluguel_ranges.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faixas de Área</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.area_ranges || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.area_ranges || data.area_ranges.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dormitórios</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.dormitorios || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.dormitorios || data.dormitorios.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suítes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.suites || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.suites || data.suites.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banheiros</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.banheiros || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.banheiros || data.banheiros.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vagas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.vagas || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.vagas || data.vagas.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {(data.flags || []).map((r: any[], idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{r[0]}</TableCell>
                    <TableCell>{r[1]}</TableCell>
                  </TableRow>
                ))}
                {(!data.flags || data.flags.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
