import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";
import { RefreshButton } from "./_components/RefreshButton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/lib/components/ui/table";

async function fetchOverview(siteKey: string) {
  const res = await fetch(
    `${process.env.SITE_URL}/api/insights/overview?site=${encodeURIComponent(
      siteKey
    )}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null as any;
  return await res.json();
}

export default async function DashboardPage() {
  const session = await getSession();
  const site = await prisma.site.findFirst({
    where: { userId: session?.userId },
    orderBy: { createdAt: "desc" },
  });
  const data = site ? await fetchOverview(site.siteKey) : null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Insights</h1>
        <RefreshButton />
      </div>
      {!data && (
        <div className="text-sm text-muted-foreground">Sem dados ainda.</div>
      )}
      {data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      )}
    </div>
  );
}


