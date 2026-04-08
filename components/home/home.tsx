"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, Trophy, Users, ChartBar } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const photos = [
  { src: "/team-pic-1.jpeg", alt: "Team photo 1" },
  { src: "/team-pic-2.jpeg", alt: "Team photo 2" },
  { src: "/team-pic-3.jpeg", alt: "Team photo 3" },
  { src: "/team-pic-4.jpeg", alt: "Team photo 4" },
];

const sponsors = [
  { name: "Rustico", img: "/rustico.png", href: "https://hellorustico.co.uk/" },
  { name: "Tarian Drums", img: "/t-drums-sponsor.jpeg", href: "https://www.tariandrums.wales/" },
  { name: "West Wales Weighing", img: "/WWW-sponsor.jpeg", href: "https://www.westwalesweighing.co.uk/" },
];

const features = [
  { icon: Target, label: "Fines", description: "Track and manage player fines", href: "/fines" },
  { icon: Users, label: "Players", description: "View player profiles and stats", href: "/players" },
  { icon: Trophy, label: "Matches", description: "Fixtures and results", href: "/fixtures" },
  { icon: ChartBar, label: "Reports", description: "Performance insights", href: "/reports" },
];

type HomeProps = {
  userName?: string | null;
  userImageUrl?: string | null;
  linkedPlayer?: { id: number; name: string; imgUrl: string | null } | null;
};

export function Home({ userName, userImageUrl, linkedPlayer }: HomeProps) {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image src="/DRT-logo.png" alt="DRT Logo" width={100} height={100} unoptimized className="mx-auto" />
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
          {userName && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex justify-center"
            >
              <Card className="w-full max-w-sm text-left">
                <CardContent className="flex items-center gap-4 p-4">
                  {(linkedPlayer?.imgUrl ?? userImageUrl) && (
                    <Image
                      src={(linkedPlayer?.imgUrl ?? userImageUrl)!}
                      alt={userName}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{userName}</p>
                    {linkedPlayer ? (
                      <p className="text-xs text-muted-foreground truncate">Linked to {linkedPlayer.name}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">No player linked</p>
                    )}
                  </div>
                  {linkedPlayer ? (
                    <Link href={`/player/${linkedPlayer.id}`}>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </Link>
                  ) : (
                    <Link href="/players">
                      <Button size="sm" variant="outline">Link Player</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
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

      {/* Instagram */}
      <section className="px-4 pb-4 max-w-5xl mx-auto flex justify-center">
        <a
          href="https://www.instagram.com/dartiau_rhieni_trisant?igsh=MTAxY3dqZW93cWNheg=="
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border px-5 py-3 hover:border-pink-500 hover:text-pink-500 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-pink-500 transition-colors">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
          <span className="text-sm font-medium">Follow us on Instagram</span>
        </a>
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

      {/* Sponsors */}
      <section className="px-4 py-12 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6">Thanks to our sponsors</p>
          <div className="grid grid-cols-3 gap-6">
            {sponsors.map(({ name, img, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary transition-colors"
              >
                <div className="relative h-20 w-full overflow-hidden rounded-lg">
                  <Image src={img} alt={name} fill unoptimized className="object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors text-center">{name}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}
