import { cookies } from "next/headers";
import { db } from "@/server";
import { eq } from "drizzle-orm";
import { team, teamPhotos, teamSponsors, playerTeams, players } from "@/server/schema";
import { TeamSettingsForm } from "@/components/teams/team-settings-form";
import { isCaptain } from "@/lib/permissions";
import { AlertCircle, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get("active-team-id")?.value
    ? parseInt(cookieStore.get("active-team-id")!.value)
    : null;

  if (!activeTeamId) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground mt-8">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">No active team selected. Use the team switcher in the nav.</p>
      </div>
    );
  }

  const captain = await isCaptain();
  if (!captain) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground mt-8">
        <Lock className="h-4 w-4" />
        <p className="text-sm">Team settings are only accessible to captains.</p>
      </div>
    );
  }

  const [activeTeam, photos, sponsors, memberships] = await Promise.all([
    db.query.team.findFirst({ where: eq(team.id, activeTeamId) }),
    db.query.teamPhotos.findMany({
      where: eq(teamPhotos.teamId, activeTeamId),
      orderBy: (t, { asc }) => [asc(t.orderIndex)],
    }),
    db.query.teamSponsors.findMany({
      where: eq(teamSponsors.teamId, activeTeamId),
      orderBy: (t, { asc }) => [asc(t.orderIndex)],
    }),
    db.query.playerTeams.findMany({ where: eq(playerTeams.teamId, activeTeamId) }),
  ]);

  if (!activeTeam) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground mt-8">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">Team not found.</p>
      </div>
    );
  }

  const allPlayers = await db.query.players.findMany();
  const members = memberships.map((m) => {
    const p = allPlayers.find((pl) => pl.id === m.playerId);
    return {
      playerId: m.playerId,
      teamId: activeTeamId,
      name: p?.name ?? "Unknown",
      imgUrl: p?.imgUrl ?? null,
      role: m.role as "captain" | "player",
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure settings for <span className="font-medium text-foreground">{activeTeam.name}</span>
        </p>
      </div>
      <TeamSettingsForm
        teamId={activeTeam.id}
        teamName={activeTeam.name}
        initialFinesEnabled={activeTeam.finesEnabled}
        initialLogoUrl={activeTeam.logoUrl ?? null}
        initialDescription={activeTeam.description ?? null}
        initialInstagramUrl={activeTeam.instagramUrl ?? null}
        initialPhotos={photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption ?? null, orderIndex: p.orderIndex }))}
        initialSponsors={sponsors.map((s) => ({ id: s.id, name: s.name, logoUrl: s.logoUrl ?? null, websiteUrl: s.websiteUrl ?? null, orderIndex: s.orderIndex }))}
        members={members}
      />
    </div>
  );
}
