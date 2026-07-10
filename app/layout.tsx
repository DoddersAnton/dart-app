import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { NavWrapper } from "@/components/nav/nav-wrapper";
import Toaster from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TeamProvider } from "@/contexts/team-context";
import { headers } from "next/headers";
import { getActiveTeamId } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "SGOR+",
  description: "SGOR+ — darts league management for players, games, and fines.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headersList, activeTeamId] = await Promise.all([headers(), getActiveTeamId()]);
  const pathname = headersList.get("x-pathname") ?? "";
  const isDisplayRoute = /^\/games\/\d+\/display/.test(pathname);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>

          <body
            className="font-sans antialiased overflow-x-hidden"
          >
            <TeamProvider initialTeamId={activeTeamId}>
              {isDisplayRoute ? (
                <>
                  <Toaster />
                  <main className="flex-1">{children}</main>
                </>
              ) : (
                <SidebarProvider>
                  <NavWrapper />
                  <Toaster />
                  {/* This is critical */}
                  <main className="flex-1">{children}</main>
                </SidebarProvider>
              )}
            </TeamProvider>
          </body>

        </html>
      </ClerkProvider>
    </ThemeProvider>
  );
}
