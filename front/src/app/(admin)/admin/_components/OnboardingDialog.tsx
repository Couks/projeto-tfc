'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog'
import { Button } from '@ui/button'
import {
  Lightbulb,
  Code2,
  BarChart3,
  Target,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

interface OnboardingDialogProps {
  open: boolean
  onComplete: () => void
}

const steps = [
  {
    title: 'Bem-vindo ao InsightHouse',
    description:
      'A plataforma de analytics para imobiliárias que transforma dados em campanhas de sucesso.',
    icon: Lightbulb,
    content: [
      'Rastreie o comportamento dos visitantes no seu site',
      'Entenda quais filtros e imóveis geram mais conversões',
      'Receba recomendações de campanhas baseadas em dados reais',
    ],
  },
  {
    title: 'Configure seu Site',
    description:
      'Adicione o script de rastreamento ao seu site para começar a coletar dados.',
    icon: Code2,
    content: [
      'Vá em Sites e cadastre seu domínio',
      'Copie o código do script fornecido',
      'Cole no <head> do seu site',
      'Pronto! Os dados começarão a ser coletados automaticamente',
    ],
  },
  {
    title: 'Analise os Insights',
    description:
      'Acesse a visão geral consolidada e análises avançadas segmentadas por categoria.',
    icon: BarChart3,
    content: [
      'Visão Geral: Dashboard com métricas principais',
      'Análise de Buscas: Entenda o que os visitantes procuram',
      'Análise de Imóveis: Veja quais imóveis geram mais interesse',
      'Análise de Conversões: Acompanhe leads e conversões',
    ],
  },
  {
    title: 'Receba Recomendações',
    description:
      'Nossa IA analisa seus dados e sugere ações para melhorar suas campanhas.',
    icon: Target,
    content: [
      'Recomendações personalizadas baseadas no seu público',
      'Identifique oportunidades de otimização',
      'Priorize ações que geram mais resultados',
      'Melhore continuamente suas estratégias de marketing',
    ],
  },
]

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
      router.push('/admin/insights')
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
    router.push('/admin/insights')
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{step.title}</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {step.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {step.content.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                      ? 'bg-primary/40'
                      : 'bg-muted'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {currentStep + 1} de {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={handlePrevious}>
                Voltar
              </Button>
            )}

            {!isLastStep && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Pular
              </Button>
            )}

            <Button onClick={handleNext} size="sm">
              {isLastStep ? 'Começar' : 'Próximo'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
