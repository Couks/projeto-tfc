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
} from "@/lib/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";
import { User2, ChevronUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
          <div className="px-2 py-2 text-sm font-semibold">Admin</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive>
                <Link href="/admin">Painel</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/sites">Sites</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/install">Configuração</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> ID: {session.userId}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Conta</span>
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
                      <button
                        type="submit"
                        className="w-full text-left"
                        onClick={redirect("/login")}
                      >
                        Sair
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-2 text-xs text-sidebar-foreground/70">v1</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground">Painel</div>
        </div>
        <div className="p-6 ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}


