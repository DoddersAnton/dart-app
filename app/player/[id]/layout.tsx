import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getPlayerSidebarItems } from "@/config/player-sidebar";

export default async function PlayerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);

  return (
    <SidebarProvider>
      <AppSidebar items={getPlayerSidebarItems(playerId)} />

      <SidebarInset className="mt-[88px]">
        <header className="flex h-14 items-center gap-2 border-b px-2">
          <SidebarTrigger />
          <h1 className="text-sm font-semibold">Player Profile</h1>
        </header>

        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
