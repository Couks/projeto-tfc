'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Separator } from '@ui/separator'
import { Badge } from '@ui/badge'
import { User, Mail, Calendar, Shield, Bell, Key } from 'lucide-react'
import { useUser } from '@/lib/hooks'
import { Skeleton } from '@ui/skeleton'

export default function AccountPage() {
  const { data: user, isLoading, error } = useUser()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
          <p className="text-muted-foreground text-lg">
            Erro ao carregar dados da conta
          </p>
        </div>
      </div>
    )
  }

  // User data from backend
  const userData = {
    name: user.name || 'User',
    email: user.email,
    createdAt: new Date(user.createdAt).toISOString().split('T')[0],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground text-lg">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {userData.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input defaultValue={userData.name} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={userData.email} type="email" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Membro desde
              </span>
              <span className="text-sm font-medium">
                {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="default">Ativo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
