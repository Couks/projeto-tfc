"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { MetricCard } from "@/lib/components/MetricCard";
import { FunnelVisualization } from "@/lib/components/FunnelVisualization";
import { ConversionsChart } from "./_components/ConversionsChart";
import { CTAPerformanceChart } from "./_components/CTAPerformanceChart";
import { useSites, useConversions } from "@/lib/hooks";
import { Skeleton } from "@ui/skeleton";
import {
  TrendingUp,
  Users,
  Phone,
  Mail,
  MessageSquare,
  FileText,
} from "lucide-react";

export default function ConversionsPage() {
  const { data: sites, isLoading: sitesLoading } = useSites();
  const firstSite = sites?.[0];

  const { data, isLoading: dataLoading } = useConversions(
    firstSite?.siteKey || ""
  );

  const isLoading = sitesLoading || dataLoading;

  // Calculate metrics
  const conversionTypes = data?.conversion_types || [];
  const totalConversions = conversionTypes.reduce(
    (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
    0
  );

  const formMetrics = data?.contact_form_metrics || {
    opened: 0,
    started: 0,
    submitted: 0,
    abandoned: 0,
    avg_completeness: 0,
  };

  const ctaPerformance = data?.cta_performance || [];
  const topProperties = data?.top_properties || [];

  // Calculate conversion rates
  const formConversionRate =
    formMetrics.opened > 0
      ? ((formMetrics.submitted / formMetrics.opened) * 100).toFixed(1)
      : "0";

  const formAbandonmentRate =
    formMetrics.started > 0
      ? ((formMetrics.abandoned / formMetrics.started) * 100).toFixed(1)
      : "0";

  // Prepare funnel data
  const funnelStages = data?.funnel_stages || [];
  const funnelData = funnelStages.map((item: any[]) => ({
    name: getFunnelStageName(item[0]),
    value: parseInt(item[1]) || 0,
  }));

  // Conversion types for pie chart
  const conversionTypesChart = conversionTypes.map(
    (item: any[], index: number) => ({
      name: item[0],
      value: parseInt(item[1]) || 0,
      color:
        [
          "hsl(var(--primary))",
          "hsl(var(--chart-1))",
          "hsl(var(--chart-2))",
          "hsl(var(--chart-3))",
        ][index] || "hsl(var(--accent))",
    })
  );

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Conversões"
          value={
            totalConversions > 0 ? totalConversions.toLocaleString() : "N/A"
          }
          description="Últimos 30 dias"
          icon={TrendingUp}
        />

        <MetricCard
          title="Formulários Enviados"
          value={
            formMetrics.submitted > 0
              ? formMetrics.submitted.toLocaleString()
              : "N/A"
          }
          description={`Taxa: ${parseFloat(formConversionRate) > 0 ? formConversionRate : "N/A"}%`}
          icon={FileText}
        />

        <MetricCard
          title="Taxa de Abandono"
          value={
            parseFloat(formAbandonmentRate) > 0
              ? `${formAbandonmentRate}%`
              : "N/A"
          }
          description={`${formMetrics.abandoned} formulários abandonados`}
          icon={MessageSquare}
        />

        <MetricCard
          title="Completude Média"
          value={
            formMetrics.avg_completeness > 0
              ? `${Math.round(formMetrics.avg_completeness)}%`
              : "N/A"
          }
          description="Campos preenchidos no formulário"
          icon={Users}
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

      {/* Form metrics detail */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas do Formulário de Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{formMetrics.opened}</div>
              <p className="text-xs text-muted-foreground mt-1">Abertos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{formMetrics.started}</div>
              <p className="text-xs text-muted-foreground mt-1">Iniciados</p>
              {formMetrics.opened > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {((formMetrics.started / formMetrics.opened) * 100).toFixed(
                    1
                  )}
                  %
                </p>
              )}
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{formMetrics.submitted}</div>
              <p className="text-xs text-muted-foreground mt-1">Enviados</p>
              {formMetrics.started > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {(
                    (formMetrics.submitted / formMetrics.started) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              )}
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formMetrics.abandoned}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Abandonados</p>
              {formMetrics.started > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {formAbandonmentRate}%
                </p>
              )}
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {Math.round(formMetrics.avg_completeness)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completude Média
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos CTAs</CardTitle>
        </CardHeader>
        <CardContent>
          <CTAPerformanceChart
            data={ctaPerformance.map((item: any[]) => ({
              cta: item[0],
              clicks: parseInt(item[1]) || 0,
            }))}
          />
        </CardContent>
      </Card>

      {/* Top converting properties */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Imóveis com Mais Conversões</CardTitle>
        </CardHeader>
        <CardContent>
          {topProperties.length > 0 ? (
            <div className="space-y-2">
              {topProperties.slice(0, 10).map((item: any[], index: number) => {
                const codigo = item[0];
                const conversions = parseInt(item[2]) || 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">Código: {codigo}</div>
                        <div className="text-sm text-muted-foreground">
                          {conversions} conversão{conversions > 1 ? "ões" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {conversions}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Nenhum dado disponível. Configure um site e aguarde dados de
                conversão.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
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
