"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Camera, ImageUp } from "lucide-react";
import { Label, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, RadialBar, RadialBarChart } from "recharts";

import { updatePlayerImageUrl } from "@/server/actions/update-player-img";
import { UploadThingImageUploader } from "@/components/players/uploadthing-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
  };
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
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PlayerOverviewClient(props: Props) {
  const [avatarUrl, setAvatarUrl] = useState(props.player.imgUrl || "");


  const radialChartData = [
    {
      name: "results",
      wins: props.totalGamesWon,
      losses: props.totalGamesLost,
    },
  ];

  const updatePlayerAvatar = async (imageUrl: string) => {
    await updatePlayerImageUrl({ id: props.player.id, url: imageUrl });
    setAvatarUrl(imageUrl);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${props.player.name} avatar`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
                {getInitials(props.player.name)}
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{props.player.name}</CardTitle>
              <p className="text-muted-foreground">Nickname: {props.player.nickname || "-"}</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Upload avatar">
                <Camera className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ImageUp className="h-4 w-4" /> Upload avatar
                </DialogTitle>
              </DialogHeader>
              <UploadThingImageUploader onUploadComplete={updatePlayerAvatar} />
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-full">
          <CardHeader className="pb-2"><CardTitle className="text-base">Fines total</CardTitle></CardHeader>
          <CardContent className="flex h-full flex-col space-y-1 text-sm">
            <div className="font-semibold">Issued: £{props.totalFinesIssuedValue.toFixed(2)}</div>
            <div>Issued: {props.finesCount}</div>
            <div>Paid: {props.paidFinesCount} (£{props.paidFinesValue.toFixed(2)})</div>
            <div>Unpaid: {props.unpaidFinesCount} (£{props.unpaidFinesValue.toFixed(2)})</div>
            <Button asChild size="sm" variant="outline" className="mt-auto">
              <Link href={`/player/${props.player.id}/financial-summary/fines`}>See Fines</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-2"><CardTitle className="text-base">Subs total</CardTitle></CardHeader>
          <CardContent className="flex h-full flex-col space-y-1 text-sm">
            <div className="font-semibold">Total: £{props.subsTotalValue.toFixed(2)}</div>
            <div>Paid: {props.paidSubsCount}</div>
            <div>Unpaid: {props.unpaidSubsCount}</div>
            <Button asChild size="sm" variant="outline" className="mt-auto">
              <Link href={`/player/${props.player.id}/financial-summary/subs`}>See Subs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-2"><CardTitle className="text-base">Player Summary</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>Seasons played: {props.seasonsPlayed}</div>
            <div>Matches played: {props.totalMatchesPlayed}</div>
            <Separator className="my-2" />
            <div>Team games: {props.teamGames.wins} / {props.teamGames.losses} ({props.teamGames.winPct}%)</div>
            <div>Doubles games: {props.doubles.wins} / {props.doubles.losses} ({props.doubles.winPct}%)</div>
            <div>Singles games: {props.singles.wins} / {props.singles.losses} ({props.singles.winPct}%)</div>

            <div className="mt-3 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="px-1 text-left">P</th>
                    <th className="px-1 text-left">W</th>
                    <th className="px-1 text-left">L</th>
                    <th className="px-1 text-left">F</th>
                    <th className="px-1 text-left">A</th>
                    <th className="px-1 text-left">R</th>
                    <th className="px-1 text-left">RK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-1">{props.overallSummary.played}</td>
                    <td className="px-1">{props.overallSummary.wins}</td>
                    <td className="px-1">{props.overallSummary.losses}</td>
                    <td className="px-1">{props.overallSummary.legsFor}</td>
                    <td className="px-1">{props.overallSummary.legsAgainst}</td>
                    <td className="px-1">{props.overallSummary.result}</td>
                    <td className="px-1">{props.overallSummary.rank}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fines by fine type</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Fines", color: "#388E3C" },
            }}
            className="mx-auto aspect-square h-[320px]"
          >
            <RadarChart data={props.fineTypeChartData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarGrid />
              <PolarAngleAxis dataKey="type" />
              <PolarRadiusAxis />
              <Radar dataKey="count" fill="#388E3C" fillOpacity={0.35} stroke="#388E3C" />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wins vs losses</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              wins: { label: "Wins", color: "#388E3C" },
              losses: { label: "Losses", color: "#A5D6A7" },
            }}
            className="mx-auto aspect-square h-[280px]"
          >
            <RadialBarChart
              data={radialChartData}
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={140}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;

                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 6} className="fill-foreground text-2xl font-bold">
                          {props.totalGamesWon}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className="fill-muted-foreground">
                          total wins
                        </tspan>
                      </text>
                    );
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar dataKey="wins" stackId="a" fill="#388E3C" cornerRadius={8} />
              <RadialBar dataKey="losses" stackId="a" fill="#A5D6A7" cornerRadius={8} />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
