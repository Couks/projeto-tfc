'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { useSiteContext } from '@/lib/providers/SiteProvider'
import {
  Search,
  Target,
  Building2,
  FormInput,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default function InsightsOverviewPage() {
  const { selectedSiteKey } = useSiteContext()

  if (!selectedSiteKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Por favor, selecione um site para visualizar as análises
        </p>
      </div>
    )
  }

  const categories = [
    {
      title: 'Análise de Buscas',
      description:
        'Entenda o que seus clientes procuram e como usam os filtros',
      icon: Search,
      href: '/admin/insights/search',
      priority: 'high',
    },
    {
      title: 'Imóveis Populares',
      description: 'Descubra quais imóveis geram mais interesse e engajamento',
      icon: Building2,
      href: '/admin/insights/properties',
      priority: 'high',
    },
    {
      title: 'Conversões',
      description:
        'Acompanhe taxas de conversão, funil de vendas e fontes de leads',
      icon: Target,
      href: '/admin/insights/conversion',
      priority: 'high',
    },
    {
      title: 'Formulários',
      description:
        'Otimize formulários identificando campos problemáticos e abandono',
      icon: FormInput,
      href: '/admin/insights/forms',
      priority: 'medium',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Central de Análises
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Insights estratégicos para impulsionar suas campanhas imobiliárias
        </p>
      </div>
      {/* Métricas Prioritárias */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Análises Prioritárias</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((c) => c.priority === 'high')
            .map((category, index) => {
              const Icon = category.icon
              const shadowClasses = [
                'shadow-layer-5',
                'shadow-layer-4',
                'shadow-layer-3',
              ]
              const shadowClass =
                shadowClasses[index] || shadowClasses[shadowClasses.length - 1]
              return (
                <Link key={category.href} href={category.href}>
                  <Card
                    className={`h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 ${shadowClass}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="mt-4">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-primary font-medium">
                        Ver Detalhes →
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
        </div>
      </div>
      {/* Análises Complementares */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Análises Complementares</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {categories
            .filter((c) => c.priority === 'medium')
            .map((category, index) => {
              const Icon = category.icon
              const shadowClasses = ['shadow-layer-2', 'shadow-layer-1']
              const shadowClass =
                shadowClasses[index] || shadowClasses[shadowClasses.length - 1]
              return (
                <Link key={category.href} href={category.href}>
                  <Card
                    className={`h-full transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer ${shadowClass}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="mt-4">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-primary font-medium">
                        Ver Detalhes →
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
        </div>
      </div>
      {/* Guia de Uso */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Como Usar Estas Análises</CardTitle>
          <CardDescription>
            Guia prático para criar campanhas efetivas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Análise de Buscas</h3>
            <p className="text-sm text-muted-foreground">
              Identifique as preferências do seu público: quais tipos de
              imóveis, regiões e características são mais buscadas. Use esses
              dados para direcionar campanhas e destacar imóveis alinhados com a
              demanda.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Imóveis Populares</h3>
            <p className="text-sm text-muted-foreground">
              Descubra quais imóveis geram mais visualizações, favoritos e
              cliques em CTAs. Priorize esses imóveis em campanhas pagas e
              destaque-os em materiais de marketing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Conversões</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe o funil de conversão completo: de visitante a lead.
              Identifique pontos de abandono e otimize as etapas com menor taxa
              de conversão para aumentar seus resultados.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Formulários</h3>
            <p className="text-sm text-muted-foreground">
              Otimize seus formulários de contato identificando campos que
              causam abandono. Simplifique o processo de captura de leads para
              aumentar conversões.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
