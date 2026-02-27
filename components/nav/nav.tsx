"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";

const navLinks = [
  {
    titleEng: "Fines",
    img: "/dart-img.png",
    navDescriptionEng: "player fines",
    href: "/fines",
    subLinks: [
      { titleEng: "Player Fines", descriptionEng: "Get player fines statement", href: "/fines" },
      { titleEng: "Add Fine", descriptionEng: "Create a new player fine", href: "/fines/add-fine" },
      { titleEng: "Fine Types", descriptionEng: "Manage fine types", href: "/fines/fine-types" },
    ],
  },
  { titleEng: "Players", img: "/dart-img.png", navDescriptionEng: "Player information", href: "/players", subLinks: [] },
  { titleEng: "Matches", img: "/dart-img.png", navDescriptionEng: "Fixtures and results", href: "/fixtures", subLinks: [] },
  {
    titleEng: "Settings",
    img: "/dart-img.png",
    navDescriptionEng: "Manage application settings",
    href: "/settings",
    subLinks: [
      { titleEng: "Locations", descriptionEng: "Manage match locations", href: "/settings/locations" },
      { titleEng: "Teams", descriptionEng: "Manage teams", href: "/settings/teams" },
      { titleEng: "Seasons", descriptionEng: "Manage seasons", href: "/settings/seasons" },
    ],
  },
] as const;

function NavText({ title }: { title: string }) {
  return (
    <span className="relative inline-block after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100">
      {title}
    </span>
  );
}

export function Nav() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [submenuOpen, setSubmenuOpen] = React.useState<Record<string, boolean>>({});

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-background/70 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/">
          <Logo />
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex gap-1 text-sm">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.titleEng} className="relative">
                {link.subLinks.length ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                      <NavText title={link.titleEng} />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-1 p-4 md:w-[420px] lg:w-[520px] lg:grid-cols-[.8fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link href={link.href} className="flex h-full w-full flex-col justify-end rounded-md bg-muted p-4">
                              <Image src={link.img} width={80} height={80} alt={link.titleEng} className="h-20 w-20" />
                              <div className="mb-1 mt-4 text-base font-semibold">{link.titleEng}</div>
                              <p className="text-sm text-muted-foreground">{link.navDescriptionEng}</p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {link.subLinks.map((subLink) => (
                          <ListItem key={subLink.titleEng} title={subLink.titleEng} href={subLink.href}>
                            {subLink.descriptionEng}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link href={link.href} className="inline-flex items-center px-3 py-2 hover:bg-transparent">
                      <NavText title={link.titleEng} />
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <SignedOut>
            <div className="text-sm">
              <SignInButton />
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ModeToggle />
          <button className="md:hidden" onClick={() => setIsMobileOpen((v) => !v)} aria-label="Toggle menu">
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 w-full bg-white p-6 dark:bg-black md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button onClick={() => setIsMobileOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-2">
                {navLinks.map((link) => (
                  <div key={link.titleEng} className="rounded-md border p-3">
                    {link.subLinks.length > 0 ? (
                      <>
                        <button
                          onClick={() =>
                            setSubmenuOpen((prev) => ({ ...prev, [link.titleEng]: !prev[link.titleEng] }))
                          }
                          className="flex w-full items-center justify-between text-left text-base font-medium"
                        >
                          {link.titleEng}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              submenuOpen[link.titleEng] && "rotate-180",
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {submenuOpen[link.titleEng] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2 space-y-2 overflow-hidden"
                            >
                              {link.subLinks.map((subLink) => (
                                <Link
                                  key={subLink.titleEng}
                                  href={subLink.href}
                                  onClick={() => setIsMobileOpen(false)}
                                  className="block rounded-md px-2 py-1 text-sm text-muted-foreground"
                                >
                                  {subLink.titleEng}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-base font-medium"
                      >
                        {link.titleEng}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted focus:bg-muted",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
