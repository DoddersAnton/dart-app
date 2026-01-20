import { SidebarItem } from "@/components/ui/app-sidebar";
import { Banknote, CalendarSync, Home, Locate, Plus, Settings, Sun, Users } from "lucide-react";

export const settingsSidebarItems: SidebarItem[] = [
  {
    label: "Overview",
    href: "/settings",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "Teams",
    href: "/settings/teams",
    icon: <Users className="h-4 w-4" />,
    children: [
      {
        label: "All Teams",
        href: "/settings/teams",
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: "Add Team",
        href: "/settings/add-team",
        icon: <Plus className="h-4 w-4" />,
      },
    ]
  },
  {
    label: "Locations",
    href: "/settings/locations",
    icon: <Locate className="h-4 w-4" />,
    children: [
      {
        label: "All Locations",
        href: "/settings/locations",
        icon: <Locate className="h-4 w-4" />,
      },
      {
        label: "Add Location",
        href: "/settings/add-location",
        icon: <Plus className="h-4 w-4" />,
      },
    ]
  },
   {
    label: "Fine Types",
    href: "/settings/fine-types",
    icon: <Banknote className="h-4 w-4" />,
  },
   {
    label: "Seasons",
    href: "/settings/seasons",
    icon: <CalendarSync className="h-4 w-4" />,
    children: [
      {
        label: "All Season",
        href: "/settings/seasons",
        icon: <Sun className="h-4 w-4" />,
      },
      {
        label: "Add Season",
        href: "/settings/add-season",
        icon: <Plus className="h-4 w-4" />,
      },
    ]
  },
  {
    label: "App Settings",
    href: "/settings/app-settings",
    icon: <Settings className="h-4 w-4" />,
  },
]