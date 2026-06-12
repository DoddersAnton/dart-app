"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ChevronDown, ChevronRight, Menu, User, X } from "lucide-react";
import { PlayerTeamEntry } from "@/server/actions/get-player-teams";
import { useTeam } from "@/contexts/team-context";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  { titleEng: "Reports", img: "/dart-img.png", navDescriptionEng: "League reports and stats", href: "/reports", subLinks: [] },
  {
    titleEng: "Settings",
    img: "/dart-img.png",
    navDescriptionEng: "Manage application settings",
    href: "/settings",
    subLinks: [
      { titleEng: "Locations", descriptionEng: "Manage match locations", href: "/settings/locations" },
      { titleEng: "Teams", descriptionEng: "Manage teams", href: "/settings/teams" },
      { titleEng: "Seasons", descriptionEng: "Manage seasons", href: "/settings/seasons" },
      { titleEng: "Award Types", descriptionEng: "Manage player award types", href: "/settings/award-types" },
      { titleEng: "Team Settings", descriptionEng: "Logo, fines toggle and team config", href: "/settings/team-settings" },
      { titleEng: "App Settings", descriptionEng: "Game rules and app configuration", href: "/settings/app-settings" },
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

type LinkedPlayer = { id: number; name: string } | null;

export function Nav({
  linkedPlayer,
  isSignedIn,
  playerTeams = [],
  activeTeamId,
  userRole,
}: {
  linkedPlayer?: LinkedPlayer;
  isSignedIn?: boolean;
  playerTeams?: PlayerTeamEntry[];
  activeTeamId?: number | null;
  userRole?: "captain" | "player" | null;
}) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [submenuOpen, setSubmenuOpen] = React.useState<Record<string, boolean>>({});
  const { switchTeam, isPending } = useTeam();

  const activeTeam = playerTeams.find((t) => t.teamId === activeTeamId);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 w-full border-b md:backdrop-blur-md",
        isMobileOpen ? "bg-white dark:bg-black" : "bg-background/70",
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Left: logo image + text stack (SGOR+ above, team name below) */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/sgor-logo.png" alt="SGOR+" width={40} height={40} unoptimized className="h-10 w-10 object-contain dark:hidden" />
            <Image src="/sgor-logo-dark.png" alt="SGOR+" width={40} height={40} unoptimized className="h-10 w-10 object-contain hidden dark:block" />
          </Link>
          <div className="flex flex-col leading-none">
            <Link href="/" className="text-sm font-bold">SGOR+</Link>
            {/* Team name sits directly under the brand text, no extra nav height */}
            {playerTeams.length > 0 && (
              <div className="block mt-0.5">
                {playerTeams.length === 1 ? (
                  <span className="text-[10px] text-muted-foreground">{activeTeam?.teamName}</span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={isPending}
                        className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {activeTeam?.teamName ?? "Select team"}
                        <ChevronRight className="h-2.5 w-2.5 rotate-90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {playerTeams.map((t) => (
                        <DropdownMenuItem
                          key={t.teamId}
                          className={`cursor-pointer ${t.teamId === activeTeamId ? "font-semibold" : ""}`}
                          onClick={() => switchTeam(t.teamId)}
                        >
                          {t.teamName}
                          {t.isDefault && <span className="ml-1 text-[10px] text-muted-foreground">(default)</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>

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
                      <div className="p-4 w-[420px] lg:w-[520px] space-y-3">
                        <NavigationMenuLink asChild>
                          <Link href={link.href} className="flex items-center gap-3 rounded-md bg-muted px-4 py-3 hover:bg-muted/80 transition-colors">
                            <Image src={link.img} width={40} height={40} alt={link.titleEng} className="h-10 w-10" />
                            <div>
                              <div className="text-sm font-semibold">{link.titleEng}</div>
                              <p className="text-xs text-muted-foreground">{link.navDescriptionEng}</p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <ul className="grid grid-cols-2 gap-1">
                          {link.subLinks.map((subLink) => (
                            <ListItem key={subLink.titleEng} title={subLink.titleEng} href={subLink.href}>
                              {subLink.descriptionEng}
                            </ListItem>
                          ))}
                        </ul>
                      </div>
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
          {isSignedIn && (
            <Link
              href={linkedPlayer ? `/player/${linkedPlayer.id}` : "#"}
              title={linkedPlayer ? `Go to ${linkedPlayer.name}'s profile` : "No player linked to your account"}
              className="hidden md:flex flex-col items-end px-2 py-1 rounded-md hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="text-sm">{linkedPlayer ? linkedPlayer.name : "My Profile"}</span>
              </div>
              {userRole && (
                <span className="text-[10px] text-muted-foreground capitalize">{userRole}</span>
              )}
            </Link>
          )}
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
              className="fixed inset-y-0 right-0 z-50 w-full bg-white p-6 opacity-100 dark:bg-black md:hidden"
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
                {isSignedIn && (
                  <div className="rounded-md border p-3">
                    {linkedPlayer ? (
                      <Link
                        href={`/player/${linkedPlayer.id}`}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                    ) : (
                      <p className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                        <User className="h-4 w-4" />
                        No player linked
                      </p>
                    )}
                  </div>
                )}
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
