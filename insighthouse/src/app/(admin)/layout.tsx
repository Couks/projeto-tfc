import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
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
} from "@ui/sidebar";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import {
  ChevronUp,
  LayoutGrid,
  Building2,
  Settings,
  Home,
  ExternalLink,
  Globe,
  HelpCircle,
  Gauge,
  GaugeCircle,
} from "lucide-react";
import { ThemeToggle } from "@/lib/components/ThemeToggle";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/lib/components/ui/collapsible";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  let user: { name: string | null; email: string | null } | null = null;
  try {
    const res = await fetch(`${process.env.SITE_URL}/api/auth/me`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      user = { name: data.name ?? null, email: data.email ?? null };
    }
  } catch {}

  return (
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
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs">Dashboard</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Visão geral">
                    <Link href="/admin/">
                      <LayoutGrid /> <span>Visão geral</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <Collapsible open={true}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild tooltip="Relatórios">
                    <Link href="/admin/">
                      <GaugeCircle /> <span>Relatórios</span>
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="/admin/dashboard">
                        <span>Métricas principais</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="/admin/dashboard/funnel">
                        <span>Funil de conversão</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="/admin/dashboard/cities">
                        <span>Top cidades</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="/admin/dashboard/types">
                        <span>Tipos de imóveis</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="/admin/dashboard/purposes">
                        <span>Finalidades</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="/admin/dashboard/prices">
                        <span>Faixas de preço</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <span className="text-xs">Gerenciamento</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Sites">
                    <Link href="/admin/sites">
                      <Building2 className="w-4 h-4" />
                      <span>Sites</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Configurações">
                    <Link href="/admin/install">
                      <Settings className="w-4 h-4" />
                      <span>Configuração</span>
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
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-medium leading-tight">
                        {user?.name || "User"}
                      </span>
                      <span className="text-[10px] text-sidebar-foreground/70 leading-tight">
                        {user?.email || session.userId}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/admin/account">
                      <span>Conta</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Pagamento</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form
                      action="/api/auth/logout"
                      method="post"
                      className="w-full"
                    >
                      <button type="submit" className="w-full text-left">
                        Sair
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="rounded-lg m-2 border border-sidebar-border shadow-layer-4 overflow-hidden">
        <div className="flex h-12 items-center justify-between border-b px-4 bg-primary/5">
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
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}


