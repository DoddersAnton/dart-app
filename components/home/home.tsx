"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, Trophy, Users, ChartBar, Instagram } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { TeamHomepageData } from "@/server/actions/get-team-homepage-data";

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
  teamData?: TeamHomepageData | null;
};

export function Home({ userName, userImageUrl, linkedPlayer, teamData }: HomeProps) {
  const teamName = teamData?.name ?? "SGOR+";
  const teamLogo = teamData?.logoUrl ?? null;
  const teamDescription = teamData?.description ?? null;
  const teamInstagram = teamData?.instagramUrl ?? null;
  const photos = teamData?.photos ?? [];
  const sponsors = teamData?.sponsors ?? [];

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4">

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full"
        >
          {/* App branding — always shown */}
          <Image src="/sgor-logo.png" alt="SGOR+" width={80} height={80} unoptimized className="mx-auto h-20 w-20 object-contain dark:hidden" />
          <Image src="/sgor-logo-dark.png" alt="SGOR+" width={80} height={80} unoptimized className="mx-auto h-20 w-20 object-contain hidden dark:block" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3">SGOR+</h1>

          {/* Team card — shown when logged in with an active team */}
          {teamData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-6 rounded-xl border bg-muted/40 text-left overflow-hidden"
            >
              {/* Team identity row */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your team</p>
                <div className="flex items-center gap-3">
                  {teamLogo ? (
                    <Image src={teamLogo} alt={teamName} width={44} height={44} unoptimized className="h-11 w-11 rounded-full object-contain border bg-background shrink-0" />
                  ) : (
                    <div className="h-11 w-11 rounded-full border bg-background flex items-center justify-center text-sm font-semibold shrink-0">
                      {teamName[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-base leading-tight">{teamName}</p>
                    {teamDescription && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{teamDescription}</p>
                    )}
                  </div>
                </div>
                {teamInstagram && (
                  <a
                    href={teamInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    <Instagram className="h-4 w-4" /> Instagram
                  </a>
                )}
              </div>

              {/* Photos */}
              {photos.length > 0 && (
                <div className="border-t grid grid-cols-2 sm:grid-cols-4 gap-2 p-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={photo.url}
                        alt={photo.caption ?? "Team photo"}
                        fill
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Sponsors */}
              {sponsors.length > 0 && (
                <div className="border-t px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your Team Sponsors</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {sponsors.map((sponsor) => {
                      const inner = (
                        <div className="w-36 flex flex-col items-center gap-2 rounded-lg border bg-background px-3 py-3 hover:border-primary transition-colors">
                          {sponsor.logoUrl ? (
                            <div className="relative h-10 w-full">
                              <Image src={sponsor.logoUrl} alt={sponsor.name} fill unoptimized className="object-contain" />
                            </div>
                          ) : null}
                          <span className="text-xs font-medium text-center leading-tight">{sponsor.name}</span>
                        </div>
                      );
                      return sponsor.websiteUrl ? (
                        <a key={sponsor.id} href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
                      ) : (
                        <div key={sponsor.id}>{inner}</div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Logged-in user profile card */}
          {userName && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4"
            >
              <Card className="text-left">
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

      {/* Feature cards */}
      <section className="pb-12">
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
    </div>
  );
}
