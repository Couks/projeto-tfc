'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
} from '@ui/sidebar'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip'
import {
  ChevronUp,
  LayoutGrid,
  Building2,
  Settings,
  Home,
  ExternalLink,
  Globe,
  HelpCircle,
  Target,
  User,
  Search,
  BarChart3,
} from 'lucide-react'
import { ThemeToggle } from '@/lib/components/ThemeToggle'
import { SiteProvider } from '@/lib/providers/SiteProvider'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@ui/collapsible'
import { useUser, useLogout } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser()
  const logoutMutation = useLogout()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <SiteProvider>
      <SidebarProvider>
        <Sidebar side="left" variant="inset" collapsible="icon">
          <SidebarHeader>
            <div className="rounded-md">
              <SidebarMenuButton asChild tooltip="Home">
                <Link href="/admin">
                  <Home className="w-6 h-6" />
                  <span className="text-md font-semibold">Insight House</span>
                </Link>
              </SidebarMenuButton>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* Dashboard Principal */}
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <span className="text-xs">Dashboard</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Visão Geral">
                      <Link href="/admin/insights">
                        <LayoutGrid /> <span>Visão Geral</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Insights Categorizados */}
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <span className="text-xs">Análises</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <Collapsible defaultOpen={true}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Análises Categorizadas">
                      <BarChart3 /> <span>Análises Avançadas</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="/admin/insights/search">
                          <Search className="w-4 h-4" />
                          <span>Buscas</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="/admin/insights/properties">
                          <Building2 className="w-4 h-4" />
                          <span>Imóveis</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="/admin/insights/conversion">
                          <Target className="w-4 h-4" />
                          <span>Conversões</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Gerenciamento */}
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <span className="text-xs">Gerenciamento</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Gerenciar Sites">
                      <Link href="/admin/sites">
                        <Building2 className="w-4 h-4" />
                        <span>Gerenciar Sites</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Configurações">
                      <Link href="/admin/install">
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Minha Conta">
                      <Link href="/admin/account">
                        <User className="w-4 h-4" />
                        <span>Minha Conta</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="text-xs">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium leading-tight">
                          {isLoading
                            ? 'Carregando...'
                            : user?.name || 'Usuário'}
                        </span>
                        <span className="text-[10px] text-sidebar-foreground/70 leading-tight">
                          {isLoading
                            ? '...'
                            : user?.email || 'user@example.com'}
                        </span>
                      </div>
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuItem>
                      <span>Pagamento</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Suporte</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="m-0 p-0">
          <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b px-4 bg-sidebar backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                      <Globe className="h-4 w-4" />
                      <span className="sr-only">Visitar meu site</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visitar meu site</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Landing page</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Landing page</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Ajuda</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ajuda</p>
                  </TooltipContent>
                </Tooltip>

                <ThemeToggle />
              </TooltipProvider>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-sidebar">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SiteProvider>
  )
}
