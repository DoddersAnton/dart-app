import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { NavWrapper } from "@/components/nav/nav-wrapper";
import Toaster from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Darts App",
  description: "Darts application for managing players, games, and fines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            className="font-sans antialiased"
          >
             <SidebarProvider>
            <NavWrapper />
            <Toaster />
            
             {/* This is critical */}
          <main className="flex-1">
            {children}
          </main>
          </SidebarProvider>
           
          </body>
        
        </html>
      </ClerkProvider>
    </ThemeProvider>
  );
}
