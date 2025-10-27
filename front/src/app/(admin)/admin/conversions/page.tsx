"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { MetricCard } from "@/lib/components/MetricCard";
import { FunnelVisualization } from "@/lib/components/FunnelVisualization";
import { ConversionsChart } from "./_components/ConversionsChart";
import { useSites, useConversions } from "@/lib/hooks";
import { Skeleton } from "@ui/skeleton";
import { TrendingUp } from "lucide-react";

export default function ConversionsPage() {
  const { data: sites, isLoading: sitesLoading } = useSites();
  const firstSite = sites?.[0];

  const { data, isLoading: dataLoading } = useConversions(
    firstSite?.siteKey || ""
  );

  const isLoading = sitesLoading || dataLoading;

  // Calculate metrics
  const conversions = data?.conversions || [];
  const totalConversions = conversions.reduce(
    (sum: number, item) => sum + item.count,
    0
  );

  // Prepare funnel data
  const funnelStages = data?.funnel || [];
  const funnelData = funnelStages.map((item) => ({
    name: getFunnelStageName(item.step),
    value: item.count,
  }));

  // Conversion types for pie chart
  const conversionTypesChart = conversions.map((item, index: number) => ({
    name: item.type,
    value: item.count,
    color:
      [
        "hsl(var(--primary))",
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
      ][index] || "hsl(var(--accent))",
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Conversões</h1>
        <p className="text-muted-foreground">
          Análise completa de conversões e formulários de contato
        </p>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <MetricCard
          title="Total de Conversões"
          value={
            totalConversions > 0 ? totalConversions.toLocaleString() : "N/A"
          }
          description="Últimos 30 dias"
          icon={TrendingUp}
        />
      </div>

      {/* Funnel visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelVisualization stages={funnelData} />

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionsChart data={conversionTypesChart} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to translate funnel stage names
function getFunnelStageName(stage: string): string {
  const names: Record<string, string> = {
    session_start: "Visitantes",
    search_submit: "Buscas Realizadas",
    viewed_property: "Visualizaram Imóvel",
    property_page_view: "Acessaram Página",
    opened_contact_form: "Abriram Formulário",
    contact_form_started: "Iniciaram Preenchimento",
    contact_form_submit: "Enviaram Formulário",
    conversion_contact_form: "Conversões (Formulário)",
    conversion_whatsapp_click: "Conversões (WhatsApp)",
    conversion_phone_click: "Conversões (Telefone)",
    conversion_email_click: "Conversões (E-mail)",
  };

  return names[stage] || stage;
}
