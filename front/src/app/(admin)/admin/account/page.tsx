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
          <h1 className="text-2xl font-semibold">Conta</h1>
          <p className="text-muted-foreground">
            Erro ao carregar dados da conta
          </p>
        </div>
      </div>
    )
  }

  // User data - simplified for the hook structure
  const userData = {
    name: user.name || 'User',
    email: user.email,
    createdAt: new Date(user.createdAt).toISOString().split('T')[0],
    plan: 'Free', // Default plan since plan is not in the hook
    notifications: true, // Default value
    twoFactor: false, // Default value
    sitesCount: 0, // Will be fetched separately if needed
    lastLogin: 'Primeiro acesso', // Default value
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Conta</h1>
        <p className="text-muted-foreground">
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
                <div className="flex gap-2">
                  <Badge variant="secondary">{userData.plan}</Badge>
                  <Badge variant="outline">
                    {userData.sitesCount}{' '}
                    {userData.sitesCount === 1 ? 'site' : 'sites'}
                  </Badge>
                </div>
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

            <div className="flex gap-2">
              <Button size="sm">Salvar alterações</Button>
              <Button size="sm" variant="outline">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span className="text-sm text-muted-foreground">
                  Plano atual
                </span>
                <Badge variant="secondary">{userData.plan}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default">Ativo</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total de sites
                </span>
                <span className="text-sm font-medium">
                  {userData.sitesCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Autenticação 2FA
                </span>
                <Badge variant={userData.twoFactor ? 'default' : 'secondary'}>
                  {userData.twoFactor ? 'Ativado' : 'Desativado'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Último acesso
                </span>
                <span className="text-sm font-medium">
                  {userData.lastLogin}
                </span>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Alterar senha
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notificações por email</p>
                <p className="text-xs text-muted-foreground">
                  Receba atualizações sobre seus sites e métricas
                </p>
              </div>
              <Button
                size="sm"
                variant={userData.notifications ? 'default' : 'outline'}
              >
                {userData.notifications ? 'Ativado' : 'Desativado'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alertas de performance</p>
                <p className="text-xs text-muted-foreground">
                  Notificações quando houver mudanças significativas
                </p>
              </div>
              <Button size="sm" variant="outline">
                Ativado
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Excluir conta</p>
                <p className="text-xs text-muted-foreground">
                  Esta ação não pode ser desfeita. Todos os seus dados serão
                  perdidos.
                </p>
              </div>
              <Button size="sm" variant="destructive">
                Excluir conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
