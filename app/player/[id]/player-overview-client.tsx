"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, ImageUp, Link2, CheckCircle2, Target, PoundSterling, TrendingUp, Dumbbell, Pencil } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updatePlayerImageUrl } from "@/server/actions/update-player-img";
import { linkPlayerUser } from "@/server/actions/link-player-user";
import { createPlayer } from "@/server/actions/create-player";
import { playerSchema, zPlayerSchema } from "@/types/add-player-schema";
import { UploadThingImageUploader } from "@/components/players/uploadthing-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ModeStats = {
  wins: number;
  losses: number;
  winPct: number;
};

type Props = {
  player: {
    id: number;
    name: string;
    nickname: string | null;
    imgUrl: string | null;
    userid: string | null;
    bio: string | null;
    dartsUsed: string | null;
    dartsWeight: number | null;
    dateOfBirth: string | null;
  };
  clerkUserId: string | null;
  totalFinesIssuedValue: number;
  finesCount: number;
  paidFinesCount: number;
  unpaidFinesCount: number;
  paidFinesValue: number;
  unpaidFinesValue: number;
  subsTotalValue: number;
  paidSubsCount: number;
  unpaidSubsCount: number;
  seasonsPlayed: number;
  totalGamesWon: number;
  totalGamesLost: number;
  totalMatchesPlayed: number;
  singles: ModeStats;
  doubles: ModeStats;
  teamGames: ModeStats;
  fineTypeChartData: { type: string; count: number }[];
  seasonTrend: { season: string; wins: number; losses: number; legsFor: number; legsAgainst: number }[];
  overallSummary: {
    played: number;
    wins: number;
    losses: number;
    legsFor: number;
    legsAgainst: number;
    result: number;
    rank: number;
  };
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function WinBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
    </div>
  );
}

export function PlayerOverviewClient(props: Props) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(props.player.imgUrl || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [linking, setLinking] = useState(false);
  const isLinked = props.clerkUserId !== null && props.player.userid === props.clerkUserId;
  const [linked, setLinked] = useState(isLinked);

  const editForm = useForm<zPlayerSchema>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      id: props.player.id,
      name: props.player.name,
      nickname: props.player.nickname ?? "",
      bio: props.player.bio ?? "",
      dartsUsed: props.player.dartsUsed ?? "",
      dartsWeight: props.player.dartsWeight ?? undefined,
      dateOfBirth: props.player.dateOfBirth
        ? new Date(props.player.dateOfBirth).toISOString().slice(0, 10)
        : "",
    },
  });

  const { execute: execEdit, status: editStatus } = useAction(createPlayer, {
    onSuccess: (data) => {
      if (data.data?.error) { toast.error(data.data.error); return; }
      if (data.data?.success) {
        toast.success(data.data.success);
        setEditOpen(false);
        router.refresh();
      }
    },
    onExecute: () => toast.info("Saving player..."),
  });

  const formatChartData = [
    { format: "Singles", wins: props.singles.wins, losses: props.singles.losses },
    { format: "Doubles", wins: props.doubles.wins, losses: props.doubles.losses },
    { format: "Team", wins: props.teamGames.wins, losses: props.teamGames.losses },
  ];

  const updatePlayerAvatar = async (imageUrl: string) => {
    await updatePlayerImageUrl({ id: props.player.id, url: imageUrl });
    setAvatarUrl(imageUrl);
    setDialogOpen(false);
  };

  const handleLinkPlayer = async () => {
    setLinking(true);
    await linkPlayerUser({ id: props.player.id });
    setLinked(true);
    setLinking(false);
  };

  return (
    <div className="space-y-6">

      {/* Player header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={`${props.player.name} avatar`} width={56} height={56} className="h-14 w-14 rounded-full border object-cover" unoptimized />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
                {getInitials(props.player.name)}
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{props.player.name}</CardTitle>
              {props.player.nickname && <p className="text-sm text-muted-foreground">{props.player.nickname}</p>}
              {props.player.dateOfBirth && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  DOB: {new Date(props.player.dateOfBirth).toLocaleDateString("en-GB")}
                  {" · "}Age: {Math.floor((Date.now() - new Date(props.player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}
                </p>
              )}
              {(props.player.dartsUsed || props.player.dartsWeight) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[props.player.dartsUsed, props.player.dartsWeight ? `${props.player.dartsWeight}g` : null]
                    .filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/practice/new?playerId=${props.player.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <Dumbbell className="h-3.5 w-3.5" /> Practice
              </Button>
            </Link>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Player</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit((v) => execEdit(v))} className="space-y-4">
                    <FormField control={editForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="nickname" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nickname</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="dateOfBirth" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={editForm.control} name="dartsUsed" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Darts Used</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. Target 22g" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="dartsWeight" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Darts Weight (g)</FormLabel>
                          <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={editForm.control} name="bio" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl><Textarea rows={4} {...field} placeholder="A short bio about the player" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={editStatus === "executing"}>Save</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <div className="flex">
            <Button variant="outline" size="icon" aria-label="Link player" onClick={handleLinkPlayer} disabled={linking || linked}
              className={`rounded-r-none border-r-0 ${linked ? "border-green-500 text-green-500" : ""}`}>
              {linked ? <CheckCircle2 className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Upload avatar" className="rounded-l-none">
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><ImageUp className="h-4 w-4" /> Upload avatar</DialogTitle>
                </DialogHeader>
                <UploadThingImageUploader onUploadComplete={updatePlayerAvatar} />
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bio */}
      {props.player.bio && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground">About</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{props.player.bio}</p></CardContent>
        </Card>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Seasons played</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{props.seasonsPlayed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Matches played</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{props.totalMatchesPlayed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Overall record</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{props.totalGamesWon}W</p>
            <p className="text-xs text-muted-foreground">{props.totalGamesLost} losses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Rank</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">#{props.overallSummary.rank > 0 ? props.overallSummary.rank : "-"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Game breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4" /> Game breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Singles", stats: props.singles },
              { label: "Doubles", stats: props.doubles },
              { label: "Team Game", stats: props.teamGames },
            ].map(({ label, stats }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-bold">{stats.wins}W – {stats.losses}L</p>
                <WinBar wins={stats.wins} losses={stats.losses} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Fines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-xl font-bold">£{props.totalFinesIssuedValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Paid</p>
                <p className="text-xl font-bold text-green-600">£{props.paidFinesValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unpaid</p>
                <p className="text-xl font-bold text-amber-500">£{props.unpaidFinesValue.toFixed(2)}</p>
              </div>
            </div>
            <Separator />
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/player/${props.player.id}/financial-summary/fines`}>View fines</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><PoundSterling className="h-4 w-4" /> Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-xl font-bold">£{props.subsTotalValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Paid</p>
                <p className="text-xl font-bold text-green-600">{props.paidSubsCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unpaid</p>
                <p className="text-xl font-bold text-amber-500">{props.unpaidSubsCount}</p>
              </div>
            </div>
            <Separator />
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/player/${props.player.id}/financial-summary/subs`}>View subs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Fines by type</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Fines", color: "#388E3C" } }} className="mx-auto h-[280px] w-full max-w-[480px]">
              <RadarChart data={props.fineTypeChartData} margin={{ top: 24, right: 56, bottom: 24, left: 56 }}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarGrid />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis />
                <Radar dataKey="count" fill="#388E3C" fillOpacity={0.35} stroke="#388E3C" />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Performance</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="format">
              <TabsList className="mb-3">
                <TabsTrigger value="format">By format</TabsTrigger>
                <TabsTrigger value="season">By season</TabsTrigger>
                <TabsTrigger value="legs">Legs</TabsTrigger>
              </TabsList>

              <TabsContent value="format">
                <ChartContainer config={{ wins: { label: "Wins", color: "#388E3C" }, losses: { label: "Losses", color: "#A5D6A7" } }} className="h-[220px] w-full">
                  <BarChart data={formatChartData} layout="vertical" margin={{ right: 8, left: 8 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="format" type="category" width={56} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <XAxis type="number" hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="wins" stackId="a" fill="#388E3C" radius={[4, 0, 0, 4]}>
                      <LabelList dataKey="wins" position="inside" className="fill-white" fontSize={11} formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                    <Bar dataKey="losses" stackId="a" fill="#A5D6A7" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="losses" position="inside" className="fill-foreground" fontSize={11} formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="season">
                <ChartContainer config={{ wins: { label: "Wins", color: "#388E3C" }, losses: { label: "Losses", color: "#A5D6A7" } }} className="h-[220px] w-full">
                  <BarChart data={props.seasonTrend} margin={{ right: 8, left: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="season" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="wins" stackId="a" fill="#388E3C" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="wins" position="inside" className="fill-white" fontSize={11} formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                    <Bar dataKey="losses" stackId="a" fill="#A5D6A7" radius={[0, 0, 4, 4]}>
                      <LabelList dataKey="losses" position="inside" className="fill-foreground" fontSize={11} formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="legs">
                <ChartContainer config={{ legsFor: { label: "Legs for", color: "#388E3C" }, legsAgainst: { label: "Legs against", color: "#A5D6A7" } }} className="h-[220px] w-full">
                  <BarChart data={props.seasonTrend} margin={{ right: 8, left: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="season" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="legsFor" stackId="a" fill="#388E3C" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="legsFor" position="inside" className="fill-white" fontSize={11} formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                    <Bar dataKey="legsAgainst" stackId="a" fill="#A5D6A7" radius={[0, 0, 4, 4]}>
                      <LabelList dataKey="legsAgainst" position="inside" className="fill-foreground" fontSize={11} formatter={(v: number) => v > 0 ? v : ""} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
