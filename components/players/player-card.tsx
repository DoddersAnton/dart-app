import { Calendar, UserIcon, UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
//import { PlayerFinesSummary } from "@/app/fines/player-fines-summary";
//import PayFinesForm from "./pay-fines";

export type Player = {
  id: number;
  name: string;
  nickname: string | null;
  team: string | null;
  createdAt: string | null;
  totalFines: number | null;
  playerFinesData: {
    id: number;
    player: string;
    fine: string;
    matchDate: string | null;
    status : string | null;
    notes: string | null;
    amount: number;
    createdAt: string | null;
  }[];
};



export default function PlayerCard({ playerData }: { playerData: Player }) {

  //<PayFinesForm playerFinesData={playerData.playerFinesData}  />
  return (
    <Card>
      <CardHeader>
        <CardTitle>{playerData.name}</CardTitle>
        <div className="flex flex-row items-center gap-6">
    <CardDescription>
          <div className="flex items-center gap-2">
            <div>
              <UserIcon size={12} />
            </div>
            <div>{playerData.nickname}</div>
          </div>{" "}
        </CardDescription>
         <CardDescription>
          <div className="flex items-center gap-2">
            <div>
              <UsersIcon size={12} />
            </div>
            <div>{playerData.team}</div>
          </div>{" "}
        </CardDescription>
         <CardDescription>
          <div className="flex items-center gap-2">
            <div>
              <Calendar size={12} />
            </div>
            <div>{playerData.createdAt}</div>
          </div>{" "}
        </CardDescription>
        </div>
    
      </CardHeader>
      <CardContent>
         <Tabs defaultValue="fines">
        <TabsList>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="fines">Fines (£{playerData.totalFines ? playerData.totalFines.toFixed(2) : "0.00"})</TabsTrigger>
          <TabsTrigger value="subs">Subs</TabsTrigger>
          <TabsTrigger value="attendances">Attendance</TabsTrigger>
        </TabsList>
         <TabsContent value="subs">
          <Card>
            <CardHeader>
              <CardTitle>Subs</CardTitle>
               <CardDescription> No Data
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                
              </div>
              <div className="grid gap-3">
               
              </div>
            </CardContent>
            <CardFooter>
              
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="fines">
          <Card>
            <CardContent className="grid gap-6">

              
               
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Games</CardTitle>
              <CardDescription> No Data
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendances">
          <Card>
            <CardHeader>
              <CardTitle>Attendance List</CardTitle>
                <CardDescription> No Data
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              
            </CardContent>
            <CardFooter>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
       
      </CardContent>
   
    </Card>
  );
}
