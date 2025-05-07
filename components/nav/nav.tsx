"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";


import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import {  Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";

const navLinks: {
  titleEng: string;
  titleWal: string;
  img: string;
  navDescriptionEng: string;
  navDescriptionWal: string;
  href: string;
  icon: string;
  subLinks: {
    titleEng: string;
    titleWal: string;
    href: string;
    descriptionEng: string;
    descriptionWal: string;
  }[];
}[] = [
  {
    titleEng: "Home",
    titleWal: "Amdanom ni",
    img: "/backtoschool-nobg.png",
    navDescriptionEng: "All essential information about the PTA",
    navDescriptionWal: "Holl wybodaeth hanfodol am y CRhA",
    href: "/",
    icon: "MdInfo",
    subLinks: [
    ],
  },
  {
    titleEng: "Fines",
    titleWal: "Codi Arian",
    img: "/dart-img.png",
    navDescriptionEng: "player fines",
    navDescriptionWal: "Pob ffordd rydym yn codi arian ar gyfer yr ysgol",
    href: "/fines",
    icon: "TbHeartHandshake",
    subLinks: [
      {
        titleEng: "Player Fines",
        titleWal: "Gweithgareddau a Ariannwyd",
        descriptionEng: "Get player fines statement",
        descriptionWal: "Darganfod beth rydym wedi'i ariannu",
        href: "/fines",
      },
      {
        titleEng: "Add Fine",
        titleWal: "Partyware i'w llogi",
        descriptionEng: "Create a new player fine",
        descriptionWal: "Mae gennym amrywiaeth o offer parti ar gael i'w llogi",
        href: "/fines/add-fine",
      },
      {
        titleEng: "Fine Types",
        titleWal: "Clwb 50:50",
        descriptionEng: "Manage fine types",
        descriptionWal: "Ymunwch â'n tynnu misol",
        href: "/fines/fine-types",
      },
    ],
  },
  {
    titleEng: "Players",
    titleWal: "Amdanom ni",
    img: "/backtoschool-nobg.png",
    navDescriptionEng: "Player information",
    navDescriptionWal: "Holl wybodaeth hanfodol am y CRhA",
    href: "/players",
    icon: "MdInfo",
    subLinks: [
    ],
  },
  
];

export function Nav() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [submenuOpen, setSubmenuOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const toggleSubmenu = (key: string) => {
    setSubmenuOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/30 dark:bg-black/30 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Left Section: Logo & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <Link href={"/"}>
            <Logo />
          </Link>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-white dark:bg-black shadow-lg rounded-lg p-4 flex flex-col gap-2 md:hidden"
            >
              {navLinks.map((link) => (
                <div key={link.titleEng} className="relative group">
                  {link.subLinks.length > 0 ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(link.titleEng)}
                        className="w-full text-left text-sm font-medium hover:text-primary flex items-center"
                      >
                        {link.titleEng}
                        <motion.span
                          animate={{
                            rotate: submenuOpen[link.titleEng] ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="ml-2 text-[8px]"
                        >
                          ▼
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {submenuOpen[link.titleEng] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="ml-4 mt-2 flex flex-col gap-2"
                          >
                            {link.subLinks.map((subLink) => (
                              <Link
                                key={subLink.titleEng}
                                href={subLink.href}
                                className="block text-sm font-medium hover:text-primary"
                              >
                                {subLink.titleEng}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="block text-sm font-medium hover:text-primary"
                    >
                      {link.titleEng}
                    </Link>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex text-[14px]">
            {navLinks.map((link) => (
              <NavigationMenuItem
                key={link.titleEng}
                className="relative group"
              >
                {link.subLinks.length > 0 ? (
                  <>
                    <NavigationMenuTrigger className="text-[12.5px] bg-none">
                      {link.titleEng}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-1 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-white to-green-50 p-6 no-underline outline-none focus:shadow-md"
                            >
                              <Image
                                src={link.img}
                                width={100}
                                height={100}
                                className="h-full w-full"
                                alt={link.img}
                              />
                              <div className="mb-2 mt-4 text-lg font-medium dark:text-black text-primary">
                                {link.titleEng}
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                {link.navDescriptionEng}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {link.subLinks.map((subLink) => (
                          <ListItem
                            key={subLink.titleEng}
                            title={subLink.titleEng}
                            href={subLink.href}
                          >
                            {subLink.descriptionEng}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className={`${navigationMenuTriggerStyle()} text-[12.5px]`}
                    >
                      {link.titleEng}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth and Theme Toggle */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <div className="hover:text-primary text-[12.5px]">
              <SignInButton />
            </div>
          </SignedOut>
            <SignedIn>
            <UserButton
            />
            </SignedIn>
          <ModeToggle />
          {/* Mobile Menu Toggle Button (Hidden on md+) */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? (
              <X className="h-6 w-6 p-0" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
