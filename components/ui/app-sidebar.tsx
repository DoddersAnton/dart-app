"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type SidebarItem = {
  label: string
  href?: string
  icon?: React.ReactNode
  children?: SidebarItem[]
}

type AppSidebarProps = {
  items: SidebarItem[]
}

export function AppSidebar({ items }: AppSidebarProps) {
  const pathname = usePathname()

  const isItemActive = (item: SidebarItem): boolean => {
    if (item.href && pathname === item.href) return true
    if (item.children) {
      return item.children.some(isItemActive)
    }
    return false
  }

  const renderItem = (item: SidebarItem, depth = 0) => {
    const active = isItemActive(item)
    const hasChildren = !!item.children?.length

    // Leaf node
    if (!hasChildren && item.href) {
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={active}
            className={depth > 0 ? "pl-8" : undefined}
          >
            <Link href={item.href} className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    }

    // Parent node
    return (
      <Collapsible
        key={item.label}
        defaultOpen={active}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={active}>
              <div className="flex w-full items-center gap-2">
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <ChevronRight
                  className="h-4 w-4 transition-transform data-[state=open]:rotate-90"
                />
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarMenuItem>

        <CollapsibleContent>
          <SidebarMenu>
            {item.children!.map((child) =>
              renderItem(child, depth + 1)
            )}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Sidebar collapsible="icon" className="mt-[85px]">
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => renderItem(item))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
