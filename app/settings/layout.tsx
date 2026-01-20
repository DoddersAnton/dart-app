import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/ui/app-sidebar"
import { settingsSidebarItems } from "@/config/settings-sidebar"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar
        items={settingsSidebarItems}
      />

      <SidebarInset className="mt-[88px]">
        {/* Page header */}
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-sm font-semibold">Settings</h1>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
