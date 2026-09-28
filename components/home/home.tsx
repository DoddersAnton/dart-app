"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { TeamHomepageData } from "@/server/actions/get-team-homepage-data";
import { HomeTeamSnapshot } from "@/server/actions/get-home-team-snapshot";
import { TitleCarousel } from "./title-carousel";
import { UpcomingFixtures } from "./upcoming-fixtures";
import { LeagueSnapshot } from "./league-snapshot";

type HomeProps = {
  userName?: string | null;
  userImageUrl?: string | null;
  linkedPlayer?: { id: number; name: string; imgUrl: string | null } | null;
  teamData?: TeamHomepageData | null;
  snapshot?: HomeTeamSnapshot | null;
};

export function Home({ userName, userImageUrl, linkedPlayer, teamData, snapshot }: HomeProps) {
  const teamName = teamData?.name ?? "SGOR+";
  const teamLogo = teamData?.logoUrl ?? null;
  const teamDescription = teamData?.description ?? null;
  const teamInstagram = teamData?.instagramUrl ?? null;
  const photos = teamData?.photos ?? [];
  const sponsors = teamData?.sponsors ?? [];

  const hasSnapshot =
    !!snapshot && (snapshot.upcomingFixtures.length > 0 || (snapshot.league?.rows.length ?? 0) > 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4">

      {/* Hero — SGOR branding stays at the top of the page */}
      <section className="relative flex flex-col items-center justify-center text-center pt-18 pb-8">
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
        </motion.div>
      </section>

      </div>

      {/* 3D scroll-driven title carousel */}
      <TitleCarousel />

      <div className="max-w-3xl mx-auto px-4">

      {/* Team details — shown when logged in */}
      {(teamData || userName) && (
      <section className="pt-4 pb-2">

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

              {/* Your profile — sits inside the team box */}
              {userName && (
                <div className="border-t px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your profile</p>
                  <div className="flex items-center gap-3">
                    {(linkedPlayer?.imgUrl ?? userImageUrl) && (
                      <Image
                        src={(linkedPlayer?.imgUrl ?? userImageUrl)!}
                        alt={userName}
                        width={44}
                        height={44}
                        unoptimized
                        className="h-11 w-11 rounded-full object-cover border shrink-0"
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
                    <ProfileCTA href={linkedPlayer ? `/player/${linkedPlayer.id}` : "/players"}>
                      {linkedPlayer ? "View Profile" : "Link Player"}
                    </ProfileCTA>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Logged-in user profile card — standalone fallback when there's no team box */}
          {userName && !teamData && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
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
                  <ProfileCTA href={linkedPlayer ? `/player/${linkedPlayer.id}` : "/players"}>
                    {linkedPlayer ? "View Profile" : "Link Player"}
                  </ProfileCTA>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </section>
      )}

      {/* Season snapshot: upcoming fixtures + league table */}
      {hasSnapshot && (
        <div className="border-t">
          {snapshot!.upcomingFixtures.length > 0 && (
            <UpcomingFixtures fixtures={snapshot!.upcomingFixtures} />
          )}
          {snapshot!.league && snapshot!.league.rows.length > 0 && (
            <LeagueSnapshot league={snapshot!.league} />
          )}
        </div>
      )}

      </div>
    </div>
  );
}

// A profile CTA wrapped in a slowly-rotating conic-gradient border to draw the eye.
function ProfileCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex shrink-0 overflow-hidden rounded-md p-[1.5px] focus:outline-none focus:ring-2 focus:ring-primary/50 border-[0.05px] border-primary"
    >
      <span
        className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, transparent 0deg, var(--primary) 140deg, transparent 220deg)",
        }}
      />
      <span className="inline-flex items-center justify-center rounded-[5px] bg-background px-3.5 py-1.5 text-xs font-semibold backdrop-blur-3xl transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {children}
      </span>
    </Link>
  );
}
