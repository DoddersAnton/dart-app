import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { NavWrapper } from "@/components/nav/nav-wrapper";
import Toaster from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Darts App",
  description: "Darts application for managing players, games, and fines.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
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
          </body>

        </html>
      </ClerkProvider>
    </ThemeProvider>
  );
}
