import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { NavWrapper } from "@/components/nav/nav-wrapper";
import Toaster from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TeamProvider } from "@/contexts/team-context";
import { headers, cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Darts App",
  description: "Darts application for managing players, games, and fines.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const pathname = headersList.get("x-pathname") ?? "";
  const isDisplayRoute = /^\/games\/\d+\/display/.test(pathname);

  const activeTeamIdRaw = cookieStore.get("active-team-id")?.value;
  const activeTeamId = activeTeamIdRaw ? parseInt(activeTeamIdRaw) : null;

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
