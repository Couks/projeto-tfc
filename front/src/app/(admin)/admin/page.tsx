'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Skeleton } from '@ui/skeleton'
import {
  Search,
  Target,
  Building2,
  Globe,
  Code,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import { useDevices } from '@/lib/hooks/useInsights'

export default function AdminHome() {
  const { selectedSiteKey } = useSiteContext()
  const { data: devicesData, isLoading: devicesLoading } = useDevices(
    selectedSiteKey || '',
    { limit: 5 }
  )

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return Smartphone
      case 'desktop':
        return Monitor
      case 'tablet':
        return Tablet
      default:
        return Monitor
    }
  }
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bem-vindo à Plataforma de Analytics Imobiliário
            </h1>
            <p className="text-muted-foreground text-lg">
              Entenda o comportamento dos visitantes e otimize suas campanhas
            </p>
          </div>
        </div>
      </div>

      {/* What is this platform */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />O que é esta
            plataforma?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Esta é uma plataforma de análise de comportamento para sites
            imobiliários. Rastreamos e analisamos como os visitantes interagem
            com seu site, quais imóveis geram mais interesse, e como você pode
            otimizar suas campanhas de marketing para gerar mais leads
            qualificados.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Rastreamento Automático</p>
                <p className="text-sm text-muted-foreground">
                  Capturamos eventos de forma automática sem prejudicar a
                  performance
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Análises Categorizadas</p>
                <p className="text-sm text-muted-foreground">
                  Organizamos os dados em categorias relevantes para seu negócio
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Insights Acionáveis</p>
                <p className="text-sm text-muted-foreground">
                  Dados transformados em recomendações práticas para suas
                  campanhas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Como Começar - Configuração Rápida
          </CardTitle>
          <CardDescription>
            Siga estes passos para começar a coletar dados do seu site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">Cadastre seu Site</h3>
                <p className="text-sm text-muted-foreground">
                  Vá em <strong>Sites</strong> e adicione o domínio do seu site
                  imobiliário. Você receberá uma chave única (Site Key) para
                  integração.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/sites">
                    <Globe className="h-4 w-4 mr-2" />
                    Gerenciar Sites
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">
                  Instale o Script de Rastreamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vá em <strong>Instalação</strong> e copie o código fornecido.
                  Cole-o no{' '}
                  <code className="bg-muted px-1 rounded">{'<head>'}</code> do
                  seu site. O script é leve e não afeta a velocidade do site.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/install">
                    <Code className="h-4 w-4 mr-2" />
                    Ver Código de Instalação
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">Aguarde a Coleta de Dados</h3>
                <p className="text-sm text-muted-foreground">
                  Após a instalação, começaremos a coletar dados
                  automaticamente. Em algumas horas você já terá insights
                  disponíveis para análise.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                4
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">Explore as Análises</h3>
                <p className="text-sm text-muted-foreground">
                  Navegue pelas diferentes categorias de análise abaixo para
                  entender o comportamento dos visitantes e otimizar suas
                  campanhas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Categories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Categorias de Análise</h2>
        </div>
        <p className="text-muted-foreground">
          Explore cada categoria para obter insights específicos sobre
          diferentes aspectos do seu site
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Search Analytics */}
          <Link href="/admin/insights/search">
            <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 shadow-layer-5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Search className="h-6 w-6 text-muted-foreground" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Análise de Buscas</CardTitle>
                <CardDescription>
                  Entenda o que seus clientes procuram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Quais tipos de imóveis são mais buscados</p>
                  <p>• Regiões de maior interesse</p>
                  <p>• Combinações de filtros populares</p>
                  <p>• Finalidades mais procuradas (venda/aluguel)</p>
                </div>
                <Badge className="mt-4" variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  Essencial para campanhas
                </Badge>
              </CardContent>
            </Card>
          </Link>

          {/* Properties Analytics */}
          <Link href="/admin/insights/properties">
            <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 shadow-layer-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Imóveis Populares</CardTitle>
                <CardDescription>
                  Descubra quais imóveis geram mais interesse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Imóveis com mais visualizações</p>
                  <p>• Favoritos e compartilhamentos</p>
                  <p>• Performance de CTAs por imóvel</p>
                  <p>• Tempo médio de engajamento</p>
                </div>
                <Badge className="mt-4" variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  Essencial para campanhas
                </Badge>
              </CardContent>
            </Card>
          </Link>

          {/* Conversion Analytics */}
          <Link href="/admin/insights/conversion">
            <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 shadow-layer-3">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Target className="h-6 w-6 text-muted-foreground" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Conversões</CardTitle>
                <CardDescription>
                  Acompanhe o funil de vendas completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Taxa de conversão de visitante para lead</p>
                  <p>• Funil de conversão por etapa</p>
                  <p>• Fontes de tráfego que convertem melhor</p>
                  <p>• Pontos de abandono no funil</p>
                </div>
                <Badge className="mt-4" variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  Essencial para campanhas
                </Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Why These Metrics Matter */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Importância das Métricas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Otimização de Campanhas</h3>
              <p className="text-sm text-muted-foreground">
                Sabendo quais tipos de imóveis e regiões geram mais interesse,
                você pode direcionar seu orçamento de marketing para as
                oportunidades mais promissoras.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">
                Decisões Baseadas em Dados
              </h3>
              <p className="text-sm text-muted-foreground">
                Em vez de adivinhar, você terá dados concretos sobre o que
                funciona e o que não funciona no seu site, permitindo ajustes
                rápidos e eficazes.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Aumento de Conversões</h3>
              <p className="text-sm text-muted-foreground">
                Identificando pontos de abandono no funil e otimizando
                formulários, você aumenta a taxa de captura de leads
                qualificados.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">
                Destaque Imóveis Estratégicos
              </h3>
              <p className="text-sm text-muted-foreground">
                Saiba quais imóveis do seu portfólio geram mais engajamento e
                priorize-os em banners, emails e campanhas pagas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices Analytics */}
      {selectedSiteKey && (
        <Card className="shadow-layer-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Dispositivos Mais Acessados
            </CardTitle>
            <CardDescription>
              Principais dispositivos, sistemas operacionais e navegadores dos
              visitantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {devicesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : devicesData?.devices && devicesData.devices.length > 0 ? (
              <div className="space-y-3">
                {devicesData.devices.map((device, index) => {
                  const DeviceIcon = getDeviceIcon(device.deviceType)
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <DeviceIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {device.deviceType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {device.os} • {device.browser}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {(device.count || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">acessos</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum dado de dispositivo disponível ainda
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
          <CardDescription>
            Links diretos para as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              asChild
              variant="outline"
              className="justify-start h-auto py-3"
            >
              <Link href="/admin/insights">
                <BarChart3 className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <p className="font-medium">Central de Análises</p>
                  <p className="text-xs text-muted-foreground">
                    Visão geral de todas as categorias
                  </p>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="justify-start h-auto py-3"
            >
              <Link href="/admin/sites">
                <Globe className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <p className="font-medium">Gerenciar Sites</p>
                  <p className="text-xs text-muted-foreground">
                    Adicionar ou configurar sites
                  </p>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="justify-start h-auto py-3"
            >
              <Link href="/admin/install">
                <Code className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <p className="font-medium">Código de Instalação</p>
                  <p className="text-xs text-muted-foreground">
                    Obter script de rastreamento
                  </p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
