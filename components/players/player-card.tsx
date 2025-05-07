import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";


export type Player = {
    id: number;
  name: string;
  nickname: string | null;
  team: string | null;
  createdAt: string | null;
  totalFines: number | null;
}

export default function PlayerCard({ playerData }: { playerData: Player }) {

  return (
    <Card>
        <CardHeader>
          <CardTitle>{playerData.name}</CardTitle>
          <CardDescription>Player Details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex-1 space-y-1 pb-3">
              <p className="text-sm font-medium leading-none">
                Nickname
              </p>
              <p className="text-sm text-muted-foreground">
              {playerData.nickname}
              </p>
            </div>
          <div className="flex-1 space-y-1 pb-3">
              <p className="text-sm font-medium leading-none">
              Team
              </p>
              <p className="text-sm text-muted-foreground">
              {playerData.team}
              </p>
            </div>
          <div className="flex-1 space-y-1  pb-3">
              <p className="text-sm font-medium leading-none">
              Total Fines
              </p>
              <p className="text-sm text-muted-foreground">
              £{playerData.totalFines?.toPrecision(4)}
              </p>
            </div>
        </CardContent>
        <CardFooter className="text-muted-foreground">
            <p>Created: {playerData.createdAt}</p>
        </CardFooter>
      </Card>
  );
}