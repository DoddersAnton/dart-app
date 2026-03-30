import { SidebarItem } from "@/components/ui/app-sidebar";
import { Banknote, CalendarCheck, ChartColumnBig, PoundSterling, HandCoins, Home, ReceiptText } from "lucide-react";

export function getPlayerSidebarItems(id: number): SidebarItem[] {
  return [
    {
      label: "Overview",
      href: `/player/${id}`,
      icon: <Home className="h-4 w-4" />,
    },
    {
      label: "Financial Summary",
      href: `/player/${id}/financial-summary`,
      icon: <Banknote className="h-4 w-4" />,
      children: [
        {
          label: "Overview",
          href: `/player/${id}/financial-summary`,
          icon: <PoundSterling className="h-4 w-4" />,
        },
        {
          label: "Fines",
          href: `/player/${id}/financial-summary/fines`,
          icon: <ReceiptText className="h-4 w-4" />,
        },
        {
          label: "Subs",
          href: `/player/${id}/financial-summary/subs`,
          icon: <HandCoins className="h-4 w-4" />,
        },
        {
          label: "Payments",
          href: `/player/${id}/financial-summary/payments`,
          icon: <PoundSterling className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Games Summary",
      href: `/player/${id}/games-summary`,
      icon: <ChartColumnBig className="h-4 w-4" />,
    },
    {
      label: "Availability",
      href: `/player/${id}/availability`,
      icon: <CalendarCheck className="h-4 w-4" />,
    },
  ];
}
