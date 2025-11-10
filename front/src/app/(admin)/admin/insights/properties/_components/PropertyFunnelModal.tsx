'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@ui/sheet'
import { Spinner } from '@ui/spinner'
import { Progress } from '@ui/progress'
import { TrendingUp, Eye, Heart, UserCheck } from 'lucide-react'
import type { PropertyFunnelResponse } from '@/lib/types/insights'

interface PropertyFunnelModalProps {
  propertyCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PropertyFunnelResponse | undefined
  isLoading: boolean
}

export function PropertyFunnelModal({
  propertyCode,
  open,
  onOpenChange,
  data,
  isLoading,
}: PropertyFunnelModalProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Funil de Conversão - Imóvel {propertyCode}</SheetTitle>
          <SheetDescription>
            Análise do funil de conversão deste imóvel
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Visualizações</span>
                </div>
                <p className="text-2xl font-bold">{data.views.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>Favoritos</span>
                </div>
                <p className="text-2xl font-bold">
                  {data.favorites.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCheck className="h-4 w-4" />
                  <span>Leads</span>
                </div>
                <p className="text-2xl font-bold">{data.leads.toLocaleString()}</p>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">Taxa de Conversão</span>
                </div>
                <span className="text-2xl font-bold">
                  {data.viewToLeadRate.toFixed(2)}%
                </span>
              </div>
              <Progress value={data.viewToLeadRate} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {data.leads} leads de {data.views} visualizações
              </p>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Etapas do Funil</h4>
              <div className="space-y-3">
                {/* Views to Favorites */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Visualizações → Favoritos
                    </span>
                    <span className="font-medium">
                      {data.views > 0
                        ? ((data.favorites / data.views) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </span>
                  </div>
                  <Progress
                    value={data.views > 0 ? (data.favorites / data.views) * 100 : 0}
                    className="h-2"
                  />
                </div>

                {/* Favorites to Leads */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Favoritos → Leads
                    </span>
                    <span className="font-medium">
                      {data.favorites > 0
                        ? ((data.leads / data.favorites) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      data.favorites > 0 ? (data.leads / data.favorites) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Sem dados de funil disponíveis para este imóvel
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}

