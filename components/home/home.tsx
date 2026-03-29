"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, Trophy, Users, ChartBar } from "lucide-react";
import { Button } from "../ui/button";

const photos = [
  { src: "/team-pic-1.jpeg", alt: "Team photo 1" },
  { src: "/team-pic-2.jpeg", alt: "Team photo 2" },
  { src: "/team-pic-3.jpeg", alt: "Team photo 3" },
  { src: "/team-pic-4.jpeg", alt: "Team photo 4" },
];

const features = [
  { icon: Target, label: "Fines", description: "Track and manage player fines", href: "/fines" },
  { icon: Users, label: "Players", description: "View player profiles and stats", href: "/players" },
  { icon: Trophy, label: "Matches", description: "Fixtures and results", href: "/fixtures" },
  { icon: ChartBar, label: "Reports", description: "Performance insights", href: "/reports" },
];

export function Home() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image src="/DRT-logo.png" alt="DRT Logo" width={100} height={100} className="mx-auto mb-2" />
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Dartiau Rhieni Trisant</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            A team of dads from Llantrisant, based at the Working Men&apos;s Club. Track our fines, results, and player performance all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/fines">
              <Button size="lg">View Fines <Target className="ml-2 h-4 w-4" /></Button>
            </Link>
            <Link href="/fixtures">
              <Button size="lg" variant="outline">Fixtures <Trophy className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Photo grid */}
      <section className="px-4 py-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                unoptimized
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="px-4 py-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {features.map(({ icon: Icon, label, description, href }) => (
            <Link key={label} href={href}>
              <div className="group rounded-xl border bg-card p-5 hover:border-primary transition-colors h-full">
                <Icon className="h-6 w-6 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
