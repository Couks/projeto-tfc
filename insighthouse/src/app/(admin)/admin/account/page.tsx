import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Separator } from "@ui/separator";
import { Badge } from "@ui/badge";
import { User, Mail, Calendar, Shield, Bell, Key } from "lucide-react";

export default async function AccountPage() {
  // Mock data - in real app, fetch from API
  const user = {
    name: "Matheus Castro",
    email: "matheuscastroks@gmail.com",
    createdAt: "2025-10-15",
    plan: "Pro",
    notifications: true,
    twoFactor: false,
  };

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
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="secondary">{user.plan}</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input defaultValue={user.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={user.email} type="email" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm">Salvar alterações</Button>
              <Button size="sm" variant="outline">Cancelar</Button>
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
                <span className="text-sm text-muted-foreground">Membro desde</span>
                <span className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Plano atual</span>
                <Badge variant="secondary">{user.plan}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default">Ativo</Badge>
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
                <span className="text-sm text-muted-foreground">Autenticação 2FA</span>
                <Badge variant={user.twoFactor ? "default" : "secondary"}>
                  {user.twoFactor ? "Ativado" : "Desativado"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Última alteração de senha</span>
                <span className="text-sm font-medium">Há 30 dias</span>
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
              <Button size="sm" variant={user.notifications ? "default" : "outline"}>
                {user.notifications ? "Ativado" : "Desativado"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alertas de performance</p>
                <p className="text-xs text-muted-foreground">
                  Notificações quando houver mudanças significativas
                </p>
              </div>
              <Button size="sm" variant="outline">Ativado</Button>
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
                  Esta ação não pode ser desfeita. Todos os seus dados serão perdidos.
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
  );
}
