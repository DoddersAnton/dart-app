"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Camera, ImageUp, Trophy } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import { updatePlayerImageUrl } from "@/server/actions/update-player-img";
import { UploadThingImageUploader } from "@/components/players/uploadthing-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  subsTotalValue: number;
  paidSubsCount: number;
  unpaidSubsCount: number;
  totalGamesWon: number;
  totalGamesLost: number;
  totalMatchesPlayed: number;
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

  const totalGames = props.totalGamesWon + props.totalGamesLost;
  const winPercent = totalGames > 0 ? Math.round((props.totalGamesWon / totalGames) * 100) : 0;

  const arc = useMemo(() => {
    const radius = 60;
    const circumference = Math.PI * radius;
    const dash = (winPercent / 100) * circumference;

    return { radius, circumference, dash };
  }, [winPercent]);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Fines total</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="text-lg font-semibold">£{props.totalFinesIssuedValue.toFixed(2)}</div>
            <div>Issues: {props.finesCount}</div>
            <div>Paid: {props.paidFinesCount} / Unpaid: {props.unpaidFinesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subs total</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="text-lg font-semibold">£{props.subsTotalValue.toFixed(2)}</div>
            <div>Paid: {props.paidSubsCount}</div>
            <div>Unpaid: {props.unpaidSubsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Win / loss</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <svg width="160" height="100" viewBox="0 0 160 100">
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 20 80 A 60 60 0 0 1 140 80"
                fill="none"
                stroke="hsl(var(--chart-1))"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${arc.dash} ${arc.circumference}`}
              />
            </svg>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {props.totalGamesWon}W / {props.totalGamesLost}L ({winPercent}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Matches played</CardTitle></CardHeader>
          <CardContent className="text-lg font-semibold">{props.totalMatchesPlayed}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wins vs losses</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              wins: { label: "Wins", color: "hsl(var(--chart-1))" },
              losses: { label: "Losses", color: "hsl(var(--chart-2))" },
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
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                      return null;
                    }

                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 6}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {props.totalGamesWon}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 14}
                          className="fill-muted-foreground"
                        >
                          total wins
                        </tspan>
                      </text>
                    );
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar dataKey="wins" stackId="a" fill="var(--color-wins)" cornerRadius={8} />
              <RadialBar dataKey="losses" stackId="a" fill="var(--color-losses)" cornerRadius={8} />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
